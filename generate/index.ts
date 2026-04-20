import { input } from '@inquirer/prompts';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

Handlebars.registerHelper('capitalize', (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
});

async function main() {
  console.log(chalk.blue.bold('\n🚀 Module Generator\n'));

  const moduleName = await input({ 
    message: 'What is the name of the new module? (e.g. category, order)',
    validate: (value) => value.length > 0 ? true : 'Module name is required'
  });

  const nameLower = moduleName.toLowerCase();
  const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1);

  const context = {
    nameLower,
    nameCapitalized
  };

  const templatesDir = path.join(__dirname, 'templates');
  const targetDir = path.join(__dirname, '../src/features', nameLower);

  if (fs.existsSync(targetDir)) {
    console.log(chalk.red(`\n❌ Error: Module '${nameLower}' already exists.`));
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'services'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'pages'), { recursive: true });

  const templates = [
    { src: 'service.hbs', dest: `services/${nameLower}.service.ts` },
    { src: 'list.hbs', dest: `pages/${nameCapitalized}ListPage.tsx` },
    { src: 'form.hbs', dest: `pages/${nameCapitalized}FormPage.tsx` }
  ];

  for (const template of templates) {
    const templatePath = path.join(templatesDir, template.src);
    const content = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(content);
    const result = compiled(context);
    
    fs.writeFileSync(path.join(targetDir, template.dest), result);
    console.log(chalk.green(`✔️ Created ${template.dest}`));
  }

  console.log(chalk.blue.bold(`\n🎉 Module '${nameCapitalized}' generated successfully!`));
  console.log(chalk.yellow('\nDon\'t forget to add your routes in src/routes/index.tsx:\n'));
  console.log(chalk.white(`import { ${nameCapitalized}ListPage } from '@/features/${nameLower}/pages/${nameCapitalized}ListPage';`));
  console.log(chalk.white(`import { ${nameCapitalized}FormPage } from '@/features/${nameLower}/pages/${nameCapitalized}FormPage';`));
  console.log(chalk.white(`\n<Route path="${nameLower}s" element={<${nameCapitalized}ListPage />} />`));
  console.log(chalk.white(`<Route path="${nameLower}s/:id" element={<${nameCapitalized}FormPage />} />\n`));
}

main().catch(console.error);
