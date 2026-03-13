
'use client';

interface PlanPanelProps {
  agentState: any;
  setActiveTab: (tab: string) => void;
}

export const PlanPanel = ({ agentState, setActiveTab }: PlanPanelProps) => {
  const samplePlans = [
    {
      id: '1',
      title: 'Video Production Pipeline',
      steps: [
        { id: '1-1', title: 'Analyze trends', status: 'completed' },
        { id: '1-2', title: 'Generate script', status: 'in-progress' },
        { id: '1-3', title: 'Create visuals', status: 'pending' },
        { id: '1-4', title: 'Render video', status: 'pending' },
        { id: '1-5', title: 'Upload to platforms', status: 'pending' },
      ],
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Automation Factory Setup',
      steps: [
        { id: '2-1', title: 'Scout GitHub repositories', status: 'completed' },
        { id: '2-2', title: 'Filter profitable automations', status: 'completed' },
        { id: '2-3', title: 'Refine and package', status: 'in-progress' },
        { id: '2-4', title: 'Deploy to marketplace', status: 'pending' },
      ],
      status: 'in-progress'
    }
  ];

  return (
    <div className="h-full w-full overflow-auto p-6 bg-[#0d1117]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Execution Plans</h1>
          <p className="text-gray-400">Current active plans and their progress</p>
        </div>

        <div className="space-y-6">
          {samplePlans.map((plan) => (
            <div key={plan.id} className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${plan.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        plan.status === 'in-progress' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-yellow-900/30 text-yellow-400'
                      }`}>
                      {plan.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {plan.steps.filter(s => s.status === 'completed').length} / {plan.steps.length} steps
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Execute
                </button>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {plan.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-green-600' :
                          step.status === 'in-progress' ? 'bg-blue-600' :
                            'bg-gray-700'
                        }`}>
                        {step.status === 'completed' && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {step.status === 'in-progress' && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{step.title}</div>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{step.status}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-[#30363d]">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((plan.steps.filter(s => s.status === 'completed').length / plan.steps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(plan.steps.filter(s => s.status === 'completed').length / plan.steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-blue-500 transition-colors text-left">
            <div className="text-blue-400 mb-2">+ Create New Plan</div>
            <div className="text-sm text-gray-400">Start a new execution plan</div>
          </button>
          <button className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-green-500 transition-colors text-left">
            <div className="text-green-400 mb-2">📋 View All Plans</div>
            <div className="text-sm text-gray-400">See all active and completed plans</div>
          </button>
        </div>
      </div>
    </div>
  );
};
