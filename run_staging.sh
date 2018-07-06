docker run --log-opt max-size=500m -d -it -p 8101:8101 --name=renthero_assistants_microservice renthero_assistants_microservice npm run staging -- --host=0.0.0.0
