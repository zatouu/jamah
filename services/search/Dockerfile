FROM python:3.12-slim
WORKDIR /srv
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt requirements-semantic.txt ./
# WITH_SEMANTIC=0 : image plus légère, recherche mot à mot seule
ARG WITH_SEMANTIC=1
RUN pip install --no-cache-dir -r $([ "$WITH_SEMANTIC" = "1" ] && echo requirements-semantic.txt || echo requirements.txt)
COPY app ./app
RUN useradd --system --create-home app
USER app
# Modèle téléchargé au premier démarrage, conservé dans un volume
ENV SEARCH_EMBEDDING_CACHE_DIR=/home/app/models
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
