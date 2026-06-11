import os

mysql_credentials = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'appuser'),
    'password': os.environ.get('MYSQL_PASSWORD', 'app123'),
    'database': os.environ.get('MYSQL_DATABASE', 'car_damage_detection'),
    'port': int(os.environ.get('MYSQL_PORT', 3306))
}