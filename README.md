## Запуск
- Собрать:
```bash
docker build -t tbl-parser-img .
```

- Запустить:
```bash
docker run -e "DEBUG" -e "THREADS=2" -p 3001:3001 tbl-parser-img
```

- Запустить (debug):
```bash
docker run -e "DEBUG=true" -e "THREADS=2" -p 3001:3001 tbl-parser-img
```
