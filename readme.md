# VoN Audition Form

Creates a website that adds a add-on to a form.

This repository uses clasp to upload the script to Google.  clasp requires a npm environment.  If you do not have one, use a node version manager to install npm.  On Windows, I used (nvm-windows)[https://github.com/coreybutler/nvm-windows] and installed npm 10.9.2.

Once npm is installed, `npm install @google/clasp -g` will install clasp.  (Reference)[https://developers.google.com/apps-script/guides/clasp]  `clasp login` will get you logged in.

To upload a project for the first time... TODO clean this up!  I think the best way would be to use `clasp create` to create a project, `git clone` to get this repo, and then copy .clasp.json from the created project into the git cloned project.

This script is intended to be deployed as a web app that can be shared with others, who will then go to the website to have this script add an add-on to the form.  This is to get around needing to manage the project with Google Cloud, which would be required to publish this as an add-on.

If you intend to do local development, use `npm -i` to get autocompletion for local development.