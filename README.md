# Travel Booking Platform (Django + Bootstrap)

This is a smart travel booking platform where users can explore, book, and manage trips. The application is built with Python (Django) on the backend, uses Bootstrap 5 for a responsive frontend, and is configured to connect to a MySQL database.

## Features

- User registration and authentication.
- Browse and filter a list of travel options (flights, trains, buses).
- View detailed information for each trip.
- Book trips with a specified number of seats.
- View and manage personal bookings ("My Bookings").
- Cancel upcoming trips.
- Check the status of any booking using a Booking ID.
- Update user profile information.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Python 3.8+**
- **pip** (Python package installer)
- **MySQL Server**

## Local Setup Instructions

Follow these steps to get the application running on your local machine.

### 1. Clone the Repository

Clone this repository to your local machine using Git:

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Create and Activate a Virtual Environment

It is highly recommended to use a virtual environment to manage project dependencies.

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**

```bash
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies

Install all the required Python packages from the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

### 4. Configure the MySQL Database

You need to create a MySQL database for the application and configure the connection settings in Django.

**a. Create a Database:**
Log in to your MySQL server and create a new database. You can use any name, for example `travel_db`.

```sql
CREATE DATABASE travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**b. Update Django Settings:**
Open the file `travel_project/settings.py`. Locate the `DATABASES` configuration block and update it with your MySQL credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'travel_db',         # Your database name
        'USER': 'your_mysql_user',   # Your MySQL username
        'PASSWORD': 'your_mysql_password', # Your MySQL password
        'HOST': 'localhost',         # Or your DB host
        'PORT': '3306',              # Or your DB port
    }
}
```

### 5. Run Database Migrations

Django uses migrations to create the necessary database tables for its features, such as the authentication system. Run the following command to apply the migrations:

```bash
python manage.py migrate
```

### 6. Run the Development Server

You are now ready to start the application. Run the development server with this command:

```bash
python manage.py runserver
```

The application will be running and accessible at **http://127.0.0.1:8000/** in your web browser.

## Project Structure

- `manage.py`: Django's command-line utility for administrative tasks.
- `requirements.txt`: A list of Python package dependencies.
- `travel_project/`: The main Django project configuration directory.
  - `settings.py`: Contains all project settings, including database configuration.
  - `urls.py`: The main URL routing file for the project.
- `travel_app/`: The core application for handling travel and booking logic.
  - `views.py`: Contains the logic for handling requests and rendering pages.
  - `urls.py`: URL routing specific to the travel app.
  - `forms.py`: Defines the forms used for user input (login, booking, etc.).
  - `services.py`: A module containing mock data and business logic.
- `templates/`: Contains all the HTML templates for the application.
  - `base.html`: The main base template that other pages extend.
  - `partials/`: Reusable template snippets like the header and footer.
