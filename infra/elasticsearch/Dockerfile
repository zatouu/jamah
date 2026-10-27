FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.3
# ICU : normalisation Unicode et repli des diacritiques (arabe, translittération latine)
RUN bin/elasticsearch-plugin install --batch analysis-icu
