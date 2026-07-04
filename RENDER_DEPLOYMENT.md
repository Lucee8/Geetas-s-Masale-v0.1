# 🚀 Beginner's Guide: Deploying Your Full-Stack App to Render (For Free)

Welcome! If you want your React frontend and your Express backend (`/api/*` endpoints) to work together in the cloud without seeing 404 console errors, **Render** is one of the best, easiest, and completely free platforms to do so.

Because we built a **unified full-stack architecture** (Express serving your React frontend), you only need to deploy **one single Web Service** on Render, and both your store and your backend API will run under the same URL!

---

## 🧭 TABLE OF CONTENTS
1. [📦 Why Render is perfect for your App](#1-why-render-is-perfect-for-your-app)
2. [🐙 Step 1: Upload Your Code to GitHub](#step-1-upload-your-code-to-github)
3. [🌐 Step 2: Sign Up and Connect GitHub to Render](#step-2-sign-up-and-connect-github-to-render)
4. [🛠️ Step 3: Create and Configure Your Web Service](#step-3-create-and-configure-your-web-service)
5. [🔑 Step 4: Add Environment Variables](#step-4-add-environment-variables)
6. [🎉 Step 5: Launch and Test Your Website](#step-5-launch-and-test-your-website)

---

## 1. 📦 Why Render is perfect for your App

Unlike static hosts (like Vercel or Netlify) which only host HTML/CSS/React and reject Node.js servers, **Render is a full-stack hosting provider**. 
* It runs our custom Node.js Express server (`server.ts`).
* In **production mode**, our Express server automatically bundles and serves your React frontend.
* This means **no 404 errors** on `/api/products`, `/api/reviews`, or `/api/orders` because they are all hosted on the exact same server and URL!

---

## 🐙 Step 1: Upload Your Code to GitHub
Before deploying to Render, your code must be saved on GitHub. (If you have already done this, you can skip to Step 2!)

1. Go to [GitHub](https://github.com/) and log in.
2. Click the **+** icon (top-right) and select **New repository**.
3. Name it `geetas-masale-store` and click the green **Create repository** button.
4. Open your terminal in VS Code or your computer, and run these commands:
   ```bash
   git init
   git add .
   git commit -m "Ready for Render deployment"
   git branch -M main
   ```
5. Copy the `git remote add origin ...` command from GitHub, paste it into your terminal, and press Enter:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/geetas-masale-store.git
   ```
6. Push your code:
   ```bash
   git push -u origin main
   ```

---

## 🌐 Step 2: Sign Up and Connect GitHub to Render

1. Open [Render.com](https://render.com/) in your browser.
2. Click **Sign Up** (or **Dashboard** if you already have an account).
3. **IMPORTANT**: Choose **Sign in with GitHub**. This links Render to your code repositories automatically!

---

## 🛠️ Step 3: Create and Configure Your Web Service

Once you are in your Render Dashboard:

1. Click the blue **"New +"** button (top-right) and select **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** and click **Next**.
3. In the list of repositories, find `geetas-masale-store` and click the **Connect** button next to it.
4. Fill in the configuration details exactly as follows:
   * **Name**: `geetas-masale-store` (or any custom name you prefer)
   * **Language / Runtime**: `Node`
   * **Region**: Choose `Singapore` (or the region closest to you and your visitors for faster loading speeds!)
   * **Branch**: `main`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
5. Scroll down and make sure the **Free** tier is selected ($0/month).

---

## 🔑 Step 4: Add Environment Variables

Before clicking create, we must define environment variables so Render runs the server in production mode:

1. On the same page, click the **"Advanced"** button (just above the create button) or look for the **"Environment Variables"** section.
2. Click **"Add Environment Variable"** and enter:
   * **Key**: `NODE_ENV`
   * **Value**: `production`
3. *(Optional)* If you set up Firebase for persistent storage, add your Firebase keys here as well:
   * `VITE_FIREBASE_API_KEY` = `your_key`
   * `VITE_FIREBASE_PROJECT_ID` = `your_project_id`
   * (and any other `VITE_FIREBASE_*` variables you have in your `.env` file)

---

## 🎉 Step 5: Launch and Test Your Website

1. Click the green **"Create Web Service"** button.
2. Render will start downloading, installing, and building your application. You will see live console logs on the screen.
3. **Wait 2-4 minutes** for the build logs to show:
   ```text
   Serving production-built static assets...
   Geeta's Spices server running on http://0.0.0.0:3000
   ```
4. At the top-left of the page, click the link next to your project name (it will look like `https://geetas-masale-store.onrender.com`).
5. **Congratulations!** Your website is now fully live in the cloud. 
   * Navigate to the home page, read recipes, read reviews, and open the Admin Dashboard (`/admin`).
   * Because your frontend and backend run together, submitting reviews, placing orders, and checking the admin panel will now communicate with the backend smoothly without any 404 errors!

---

### 💡 Beginner Tips for Render's Free Tier:
* **The "Spin-Up" Delay**: Render puts free servers to sleep if they haven't received any visitors for 15 minutes. If you open your website after a long time, it might take **30-45 seconds** to load initially while the server wakes up. This is completely normal and expected for Render's free plan!
* **Automatic Updates**: Every time you make a change in your code and push it to GitHub (`git push`), Render will automatically detect it, rebuild, and update your live website instantly!
