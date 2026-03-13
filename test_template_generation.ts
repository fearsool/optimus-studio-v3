
import { getTemplates, createBlueprintFromTemplate } from './src/services/templates/store';
import { NodeType, StepStatus } from './src/types';

async function runTest() {
    console.log('Fetching templates...');
    const allTemplates = await getTemplates();
    console.log(`Total templates found: ${allTemplates.length}`);

    // Test specific categories
    const categoriesToTest = ['content', 'scraper', 'assistant', 'digital', 'unknown_category'];

    for (const cat of categoriesToTest) {
        console.log(`\n--- Testing Category: ${cat} ---`);
        const template = allTemplates.find(t => t.category === cat);

        if (template) {
            console.log(`Selected Template: ${template.name} (ID: ${template.id})`);

            // Generate blueprint
            const blueprint = createBlueprintFromTemplate(template);

            console.log(`Blueprint ID: ${blueprint.id}`);
            console.log(`Node Count: ${blueprint.nodes.length}`);

            if (blueprint.nodes.length > 0) {
                console.log('Nodes:');
                blueprint.nodes.forEach((node, index) => {
                    console.log(`  ${index + 1}. [${node.type}] ${node.title} - ${node.task}`);
                });
            } else {
                console.log('WARNING: No nodes generated for this template!');
            }

            // Check if generated logic matches expectations
            const nodeTypes = blueprint.nodes.map(n => n.type);
            console.log(`Node Types Sequence: ${nodeTypes.join(' -> ')}`);

        } else {
            console.log(`No template found for category: ${cat}`);
        }
    }
}

runTest().catch(console.error);
