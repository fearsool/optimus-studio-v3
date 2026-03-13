// Windows servisi doğrudan TS çalıştıramayabilir, bu yüzden ts-node register ediyoruz
require('ts-node').register({
    project: require('path').join(__dirname, '../tsconfig.agent.json')
});
require('./start-agent.ts');
