"""Stress test: locust -f tests/load/locustfile.py --host http://localhost:8000"""
from locust import HttpUser, between, task


class HealthUser(HttpUser):
    wait_time = between(0.5, 2)

    @task
    def health(self):
        self.client.get("/health")
    # TODO: login as driver and POST /api/v1/ambulances/{id}/location at 1 Hz
