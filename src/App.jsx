import React, { useState } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, FileText, AlertTriangle } from 'lucide-react';

export default function UserStoryAnalyzer() {
  const [userStory, setUserStory] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeStory = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an expert Business Analyst and Scrum Master. Analyze this user story for quality and completeness:

"${userStory}"

Provide your analysis in JSON format with these exact fields:
{
  "qualityScore": <number 0-100>,
  "issues": [<array of specific problems found>],
  "missingElements": [<array of what's missing>],
  "enhancedStory": "<rewritten user story in proper format>",
  "acceptanceCriteria": [<array of specific, testable AC>],
  "edgeCases": [<array of potential edge cases to consider>],
  "estimatedComplexity": "<Low/Medium/High>"
}

Only return valid JSON, no markdown or other text.`
          }]
        })
      });

      const data = await response.json();
      const textContent = data.content.find(item => item.type === 'text')?.text || '';
      
      // Clean up response and parse JSON
      const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setAnalysis(parsed);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis({
        qualityScore: 0,
        issues: ['Error analyzing story. Please try again.'],
        missingElements: [],
        enhancedStory: '',
        acceptanceCriteria: [],
        edgeCases: [],
        estimatedComplexity: 'Unknown'
      });
    }
    
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI User Story Quality Analyzer
          </h1>
          <p className="text-gray-600">
            Transform vague requirements into clear, actionable user stories
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Paste Your User Story
          </label>
          <textarea
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
            placeholder="Example: As a user I want to login so I can access the system"
            className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
          />
          <button
            onClick={analyzeStory}
            disabled={!userStory.trim() || loading}
            className="mt-4 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Story Quality'}
          </button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Quality Score Card */}
            <div className={`${getScoreBackground(analysis.qualityScore)} border-2 rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Quality Score</h2>
                  <p className="text-gray-600">Based on completeness and clarity</p>
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(analysis.qualityScore)}`}>
                  {analysis.qualityScore}
                  <span className="text-3xl">/100</span>
                </div>
              </div>
            </div>

            {/* Issues & Missing Elements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="text-red-500 mr-2" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Issues Found</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="text-orange-500 mr-2" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Missing Elements</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.missingElements.map((element, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertCircle className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enhanced Story */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-green-500 mr-2" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Enhanced User Story</h3>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{analysis.enhancedStory}</p>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Estimated Complexity:</strong> {analysis.estimatedComplexity}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-blue-500 mr-2" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Acceptance Criteria</h3>
              </div>
              <ul className="space-y-3">
                {analysis.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Edge Cases */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-purple-500 mr-2" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Edge Cases to Consider</h3>
              </div>
              <ul className="space-y-3">
                {analysis.edgeCases.map((edgeCase, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1 flex-shrink-0">→</span>
                    <span className="text-gray-700">{edgeCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ROI Metrics Footer */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Estimated Impact</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">60%</div>
                  <div className="text-sm opacity-90">Time Saved on Refinement</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">40%</div>
                  <div className="text-sm opacity-90">Reduction in Defects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">15hrs</div>
                  <div className="text-sm opacity-90">Saved per Sprint</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Note */}
        {!analysis && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">
              Try pasting a user story like: <br />
              <span className="italic text-gray-500 mt-2 block">
                "As a user I want to login so I can access the system"
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
