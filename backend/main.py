from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import openai
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests

load_dotenv()

app = FastAPI(title="JobAI Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

class JobRequest(BaseModel):
    url: str = None
    job_text: str = None
    resume_text: str

@app.get("/")
async def root():
    return {"message": "JobAI Agent Backend is running"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return {"resume_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from apify_client import ApifyClient

@app.post("/process-job")
async def process_job(request: JobRequest):
    job_description = request.job_text
    apify_token = os.getenv("APIFY_API_TOKEN")
    
    if request.url and not job_description:
        # Try Apify first if token is available
        if apify_token:
            try:
                client = ApifyClient(apify_token)
                run_input = {
                    "query": request.url,
                    "maxResults": 1,
                }
                # Run the actor and wait for it to finish
                run = client.actor("apify/rag-web-browser").call(run_input=run_input)
                
                # Fetch results
                results = list(client.dataset(run["defaultDatasetId"]).iterate_items())
                if results and "text" in results[0]:
                    job_description = results[0]["text"]
                elif results and "markdown" in results[0]:
                    job_description = results[0]["markdown"]
                
            except Exception as e:
                print(f"Apify scraping failed: {str(e)}")
                # Fall back to basic scraping below

        # Fallback to basic scraping if Apify is not used or fails
        if not job_description:
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                response = requests.get(request.url, headers=headers)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                for tag in soup(["script", "style"]):
                    tag.decompose()

                job_description = soup.get_text(separator=' ', strip=True)
                job_description = job_description[:4000]
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

    if not job_description:
        raise HTTPException(status_code=400, detail="Job description or URL is required")

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        system_prompt = "You are an expert career coach and resume writer. Your goal is to help candidates get hired by optimizing their resumes and writing compelling cover letters."
        
        user_prompt = f"""
        Analyze the following Resume and Job Description.
        
        RESUME:
        {request.resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        Please provide:
        1. An 'optimized_resume' summary and key bullet points tailored to this specific job.
        2. A professional 'cover_letter' (max 400 words).
        3. A 'match_score' between 0 and 100 based on requirements.
        
        Output MUST be in valid JSON format with keys: optimized_resume, cover_letter, match_score.
        """

        # In case the user hasn't provided an API key yet, we return a helpful mock
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
            return {
                "optimized_resume": "AI Optimization: As a DevOps Engineer, highlight your experience with Kubernetes and CI/CD pipelines mentioned in the job description. (Note: OpenAI API Key not configured)",
                "cover_letter": "Dear Hiring Manager,\n\nI am excited to apply for the DevOps position... (Note: This is a placeholder as the API key is missing)",
                "match_score": 75
            }

        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106", # Using 1106 for JSON mode support
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import FileResponse
import tempfile

@app.post("/generate-pdf")
async def generate_pdf(request: dict):
    content = request.get("content")
    if not content:
        raise HTTPException(status_code=400, detail="Content is required")
    
    try:
        # Create a temporary file
        fd, path = tempfile.mkstemp(suffix=".pdf")
        c = canvas.Canvas(path, pagesize=letter)
        width, height = letter
        
        # Simple text wrapping logic for the PDF
        textobject = c.beginText()
        textobject.setTextOrigin(50, height - 50)
        textobject.setFont("Helvetica", 12)
        
        lines = content.split('\n')
        for line in lines:
            # Very basic line splitting
            while len(line) > 80:
                textobject.textLine(line[:80])
                line = line[80:]
            textobject.textLine(line)
        
        c.drawText(textobject)
        c.showPage()
        c.save()
        os.close(fd)
        
        return FileResponse(path, filename="Optimized_Resume.pdf", media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-jobs")
async def search_jobs(request: dict):
    query = request.get("query")
    apify_token = os.getenv("APIFY_API_TOKEN")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    if not apify_token:
        raise HTTPException(status_code=400, detail="Apify API Token not configured")
        
    try:
        client = ApifyClient(apify_token)
        # Using a specialized scraper for better structured data
        run_input = {
            "queries": query,
            "maxPagesPerQuery": 1
        }
        # For simplicity and speed in this demo, we'll use rag-web-browser with search keywords
        # But formatted for job results
        run = client.actor("apify/rag-web-browser").call(run_input={
            "query": f"site:linkedin.com/jobs {query}",
            "maxResults": 5
        })
        
        results = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        # Transform results to a standard job format
        jobs = []
        for res in results:
            jobs.append({
                "id": res.get("url"),
                "title": res.get("metadata", {}).get("title", "Job Opportunity"),
                "company": "LinkedIn",
                "url": res.get("url"),
                "snippet": res.get("markdown", "")[:200] + "..."
            })
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
