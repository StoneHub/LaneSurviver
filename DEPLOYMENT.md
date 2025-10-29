# Deployment Guide

This guide provides instructions on how to deploy the Lane Survivor game as a static website on your `flyingchanges.net` domain.

## 1. Project Structure

For this deployment, we'll create a "dev corner" page at `flyingchanges.net/dev-corner` and host the game at `flyingchanges.net/dev-corner/lane-survivor`.

Here's the recommended directory structure on your web server:

```
/ (your web root, e.g., /var/www/html)
|-- dev-corner/
|   |-- index.html  (your dev corner page)
|   |-- lane-survivor/
|   |   |-- index.html
|   |   |-- styles/
|   |   |   |-- main.css
|   |   |   |-- modal.css
|   |   |-- src/
|   |   |   |-- ... (all game source files)
|   |   |-- ... (other game files and directories)
```

## 2. Dev Corner Page

Create a new `index.html` file in the `/dev-corner` directory. This will be your "dev corner" page.

Here's a simple example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Corner</title>
</head>
<body>
  <h1>Dev Corner</h1>
  <p>Welcome to my development corner. Here are some of my projects:</p>
  <ul>
    <li><a href="/dev-corner/lane-survivor/">Lane Survivor</a></li>
  </ul>
</body>
</html>
```

## 3. Deploying the Game

1.  **Copy Game Files:** Copy all the files and directories from your local Lane Survivor project to the `/dev-corner/lane-survivor/` directory on your web server.

2.  **Verify File Paths:** Ensure that all the file paths in your `index.html` are correct. The current project uses relative paths (e.g., `src/main.js`), which should work without any changes.

3.  **Web Server Configuration:** Make sure your web server is configured to serve static files. For most servers (like Apache or Nginx), this is the default behavior.

## 4. Accessing the Game

Once you've deployed the files, you should be able to access:

*   Your dev corner at `http://flyingchanges.net/dev-corner`
*   The game at `http://flyingchanges.net/dev-corner/lane-survivor/`

That's it! The game is a static website and doesn't require any special server-side configuration.
