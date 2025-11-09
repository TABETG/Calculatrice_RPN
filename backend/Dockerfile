# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app

# Railway/Fly/... exposent $PORT ; fallback 8000 en local
ENV PYTHONUNBUFFERED=1
CMD ["bash","-lc","exec gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${PORT:-8000} app.main:app"]
