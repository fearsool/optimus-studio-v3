
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const TaskNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`px-4 py-2 shadow-md rounded-md bg-[#1e1e1e] border-2 min-w-[150px] ${selected ? 'border-blue-500' : 'border-[#333]'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-900 text-blue-200 mr-3 text-xs">
                    {data.icon || '⚡'}
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-200">{data.label}</div>
                    <div className="text-xs text-gray-500">{data.description || 'Action Node'}</div>
                </div>
            </div>

            {data.status && (
                <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full w-fit ${data.status === 'running' ? 'bg-yellow-900 text-yellow-200' :
                        data.status === 'done' ? 'bg-green-900 text-green-200' :
                            'bg-gray-800 text-gray-400'
                    }`}>
                    {data.status.toUpperCase()}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
        </div>
    );
};

export default memo(TaskNode);
