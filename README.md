## Запуск
- Собрать:
```bash
docker build -t tbl-parser-img .
```

- Запустить:
```bash
docker run -e "DEBUG=true" -e "THREADS=2" -p 3003:3001 --name tobelease-parser tbl-parser-img
```

- Запустить (debug):
```bash
docker run -e "DEBUG=true" -e "THREADS=2" -p 3003:3001 --name tobelease-parser tbl-parser-img
```
