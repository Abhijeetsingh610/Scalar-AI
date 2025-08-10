// Test script to verify API endpoints
// You can run this in browser console or as a Node.js script

const testPersonalizeAPI = async () => {
  const testData = {
    job_role: 'Student',
    experience_level: 'Student', 
    career_goals: 'Want to become a ML engineer',
    preferred_tech_stack: ['Python', 'Machine Learning/AI']
  }

  try {
    const response = await fetch('/api/llm/personalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Personalize API Response:', result)
    return result
  } catch (error) {
    console.error('Personalize API Error:', error)
  }
}

const testGenerateCourseAPI = async () => {
  const testData = {
    userProfile: {
      job_role: 'Student',
      experience_level: 'Student',
      career_goals: 'Want to become a ML engineer',
      tech_stack: ['Python', 'Machine Learning/AI']
    },
    skillGaps: ['Advanced Python', 'Deep Learning', 'MLOps'],
    careerGoals: 'Want to become a ML engineer'
  }

  try {
    const response = await fetch('/api/llm/generate-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Generate Course API Response:', result)
    return result
  } catch (error) {
    console.error('Generate Course API Error:', error)
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPersonalizeAPI, testGenerateCourseAPI }
}

console.log('Test functions loaded. Run testPersonalizeAPI() or testGenerateCourseAPI() to test.')
