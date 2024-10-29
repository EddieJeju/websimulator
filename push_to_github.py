import subprocess
import requests
import json
import os
import sys

def run_git_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    # Verify GitHub token exists
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("Error: GITHUB_TOKEN not found in environment variables")
        return False

    # GitHub API headers
    headers = {
        'Authorization': f'Bearer {github_token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    # Get username
    try:
        user_response = requests.get('https://api.github.com/user', headers=headers)
        if user_response.status_code != 200:
            print(f"Failed to get user information: {user_response.status_code}")
            print(f"Response: {user_response.text}")
            return False

        username = user_response.json()['login']
        print(f"Authenticated as GitHub user: {username}")

    except Exception as e:
        print(f"Error getting user information: {str(e)}")
        return False

    # Create repository
    repo_data = {
        'name': 'heating-efficiency-simulator',
        'description': 'An interactive web simulator comparing ancient and modern heating efficiency using Flask and JavaScript',
        'private': False
    }

    try:
        repo_response = requests.post('https://api.github.com/user/repos', headers=headers, json=repo_data)
        if repo_response.status_code not in [201, 422]:  # 422 means repo exists
            print(f"Failed to create repository: {repo_response.status_code}")
            print(f"Response: {repo_response.text}")
            return False
        
        print("Repository created or already exists")

    except Exception as e:
        print(f"Error creating repository: {str(e)}")
        return False

    # Git commands
    commands = [
        'git init',
        'git config --global user.email "replit@example.com"',
        'git config --global user.name "Replit"',
        'git add .',
        'git commit -m "Initial commit: Heating Efficiency Simulator\n\nFeatures:\n- Interactive room parameters\n- Heat distribution visualization\n- Multiple heating methods comparison\n- Cost calculator\n- Environmental impact metrics"',
        f'git remote add origin https://oauth2:{github_token}@github.com/{username}/heating-efficiency-simulator.git',
        'git branch -M main',
        'git push -u origin main --force'
    ]

    for cmd in commands:
        print(f"Executing: {cmd.split()[0]} ...")
        success, output = run_git_command(cmd)
        if not success:
            print(f"Failed to execute git command: {output}")
            return False
        print("Command succeeded")

    print(f"Successfully pushed to https://github.com/{username}/heating-efficiency-simulator")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
