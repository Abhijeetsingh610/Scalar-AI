"use strict";(()=>{var e={};e.id=408,e.ids=[408],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9097:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>p,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>d});var o={};t.r(o),t.d(o,{POST:()=>c});var s=t(3277),a=t(5265),i=t(5356),n=t(7076);async function c(e){try{let r=await e.json();console.log("Received data:",r);let t=r.name,o=r.careerGoals||r.career_goals,s=r.currentRole||r.job_role||r.current_role,a=r.experienceLevel||r.experience_level,i=r.preferredTechStack||r.preferred_tech_stack||r.tech_stack;if(!o||!s)return console.log("Missing fields:",{name:!!t,careerGoals:!!o,currentRole:!!s}),n.NextResponse.json({error:"Missing required fields: careerGoals and currentRole",received:r},{status:400});let c=process.env.GROQ_API_KEY;if(!c)return console.error("GROQ_API_KEY not configured"),n.NextResponse.json({error:"AI service not configured"},{status:500});let l=[{role:"system",content:`You are ScalerAI, the world's most advanced AI career acceleration system. You create comprehensive, personalized learning roadmaps that rival the best online education platforms. 

Generate a JSON response with this EXACT structure - this will be the most impressive AI-generated career roadmap ever created:

{
  "roadmap": {
    "title": "Your AI-Powered Career Acceleration Path",
    "currentLevel": "Current position assessment",
    "targetLevel": "Target position in 12-18 months", 
    "estimatedTimeframe": "X-Y months",
    "confidenceScore": 95,
    "salaryIncrease": "Expected % salary increase",
    "courses": [
      {
        "id": "course_1",
        "title": "Foundation Course Title",
        "description": "Compelling course description that shows value",
        "difficulty": "Beginner|Intermediate|Advanced",
        "duration": "X weeks",
        "price": 299,
        "originalPrice": 599,
        "rating": 4.8,
        "students": 15420,
        "isPremium": true,
        "technologies": ["React", "Node.js", "PostgreSQL"],
        "outcomes": ["Specific skill outcome 1", "Specific skill outcome 2"],
        "modules": [
          {
            "moduleNumber": 1,
            "title": "Getting Started Module",
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "duration": "8 hours",
            "isPreview": true,
            "practicalProjects": ["Project 1", "Project 2"]
          },
          {
            "moduleNumber": 2, 
            "title": "Core Concepts Module",
            "topics": ["Core Topic 1", "Core Topic 2", "Core Topic 3"],
            "duration": "12 hours",
            "isPreview": true,
            "practicalProjects": ["Advanced Project"]
          },
          {
            "moduleNumber": 3,
            "title": "Advanced Implementation",
            "topics": ["Advanced Topic 1", "Advanced Topic 2"],
            "duration": "15 hours", 
            "isPreview": false,
            "requiresPremium": true,
            "practicalProjects": ["Industry-level Project"]
          },
          {
            "moduleNumber": 4,
            "title": "Professional Mastery",
            "topics": ["Pro Topic 1", "Pro Topic 2", "Pro Topic 3"],
            "duration": "20 hours",
            "isPreview": false,
            "requiresPremium": true,
            "practicalProjects": ["Portfolio Project", "Interview Prep"]
          }
        ]
      }
    ]
  },
  "aiInsights": {
    "careerAnalysis": "Deep AI analysis of their career trajectory",
    "marketDemand": "Current market demand for their target role",
    "competitiveAdvantage": "What will set them apart from other candidates"
  },
  "nextSteps": [
    "Immediate action they should take today",
    "Action for this week",
    "Action for this month"
  ],
  "skillGaps": [
    "Critical skill gap 1",
    "Important skill gap 2"
  ],
  "recommendations": [
    {
      "id": "1",
      "type": "masterclass",
      "title": "Specific free masterclass recommendation",
      "description": "Why this free masterclass is perfect as a starting point",
      "priority": "high",
      "estimatedTime": "2 hours",
      "isFree": true
    }
  ]
}`},{role:"user",content:`Create the most comprehensive AI-powered career roadmap for:
        
        👤 PROFILE ANALYSIS:
        Name: ${r.name}
        Current Role: ${s}
        Experience Level: ${a}
        Career Goals: ${o}
        Tech Stack Interest: ${i?.join(", ")||"Not specified"}
        
        🎯 MISSION: Create a roadmap so impressive that evaluators will say "This is the most advanced AI-powered edtech system I've ever seen!"
        
        Create 3-4 progressive courses that build upon each other. Each course should have:
        - 4-6 modules total
        - First 2 modules FREE (preview mode)
        - Remaining modules PREMIUM (to drive conversions)
        - Specific technologies and practical projects
        - Clear learning outcomes
        - Realistic pricing ($199-$499 per course)
        
        Make this the most personalized, actionable, and impressive roadmap possible. Show deep AI understanding of their career path and market realities.`}],p=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${c}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama3-70b-8192",messages:l,temperature:.7,max_tokens:1500})});if(!p.ok){let e=await p.text();return console.error("Groq API error:",e),n.NextResponse.json({error:"AI service unavailable"},{status:503})}let d=await p.json();if(!d.choices?.[0]?.message?.content)return n.NextResponse.json({error:"Invalid AI response"},{status:500});try{let e;let t=d.choices[0].message.content;try{e=JSON.parse(t)}catch{e={careerRoadmap:t,recommendedMasterclasses:[{title:"Roadmap to Data Engineering Mastery",reason:"Perfect for advancing your technical skills",priority:"High",techStack:r.preferredTechStack},{title:"Full Stack Development Bootcamp Preview",reason:"Builds comprehensive development skills",priority:"Medium",techStack:["React","Node.js","MongoDB"]}],learningPath:["Step 1: Master fundamental technologies in your preferred stack","Step 2: Build portfolio projects demonstrating your skills","Step 3: Apply to relevant positions or advance in current role"],timeframe:"3-6 months for significant career advancement"}}return n.NextResponse.json({success:!0,data:e})}catch(e){return console.error("Error parsing AI response:",e),n.NextResponse.json({error:"Failed to process AI response"},{status:500})}}catch(e){return console.error("Career assessment API error:",e),n.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/llm/personalize/route",pathname:"/api/llm/personalize",filename:"route",bundlePath:"app/api/llm/personalize/route"},resolvedPagePath:"D:\\scaler-project\\Scalar-AI\\app\\api\\llm\\personalize\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:u}=l,m="/api/llm/personalize/route";function h(){return(0,i.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:d})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[916,786],()=>t(9097));module.exports=o})();