import { Activity, GitCommit, AlertTriangle, CheckCircle } from 'lucide-react';

export const ActivityFeed = () => {
    const activities = [
        { id: 1, type: 'commit', message: 'System auto-healed 2 modules', time: '2m ago', icon: <CheckCircle size={14} className="text-green-500" /> },
        { id: 2, type: 'alert', message: 'High CPU usage detected (Agent Core)', time: '15m ago', icon: <AlertTriangle size={14} className="text-yellow-500" /> },
        { id: 3, type: 'git', message: 'Optimus Agent v3.1 deployed', time: '1h ago', icon: <GitCommit size={14} className="text-blue-500" /> },
        { id: 4, type: 'system', message: 'Database backup completed', time: '3h ago', icon: <Activity size={14} className="text-purple-500" /> },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                <Activity size={16} /> Recent Activity
            </h3>
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-xs">
                        <div className="mt-0.5">{activity.icon}</div>
                        <div>
                            <div className="text-gray-300">{activity.message}</div>
                            <div className="text-gray-600 text-[10px]">{activity.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
