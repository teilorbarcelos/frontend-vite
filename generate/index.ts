import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';

Handlebars.registerHelper('capitalize', (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('upper', (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str.toUpperCase();
});

function updateRootFiles(nameLower: string) {
  const routesPath = path.join(__dirname, '../src/routes/index.tsx');
  const layoutPath = path.join(__dirname, '../src/layouts/AppLayout.tsx');

  const inject = (filePath: string, marker: string, code: string, check: string) => {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(check)) return;

    const lines = content.split('\n');
    const markerIndex = lines.findIndex(l => l.includes(marker));
    if (markerIndex === -1) return;

    const indentation = lines[markerIndex].match(/^\s*/)?.[0] || '';
    lines.splice(markerIndex, 0, `${indentation}${code}`);
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(chalk.green(`✔️ Updated ${path.basename(filePath)}`));
  };

  {
    inject(routesPath, '// [GENERATE_FEATURE_ROUTES_IMPORT]', `import { ${nameLower}Routes } from '@/features/${nameLower}/routes';`, `@/features/${nameLower}/routes`);
    inject(routesPath, '// [GENERATE_FEATURE_ROUTES_SPREAD]', `...${nameLower}Routes,`, `...${nameLower}Routes`);
  }

  {
    inject(layoutPath, '// [GENERATE_FEATURE_MENU_IMPORT]', `import { ${nameLower}Menu } from '@/features/${nameLower}/menu';`, `@/features/${nameLower}/menu`);
    inject(layoutPath, '// [GENERATE_FEATURE_MENU_ITEM]', `${nameLower}Menu,`, `${nameLower}Menu,`);
  }
}

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

  // Create directory structure
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'services'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'services', '__tests__'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'pages', '__tests__'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'constants'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'constants', '__tests__'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'hooks'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'hooks', '__tests__'), { recursive: true });

  const templates = [
    // Services
    { src: 'service.hbs', dest: `services/${nameLower}.service.ts` },
    { src: 'serviceTest.hbs', dest: `services/__tests__/${nameLower}.service.test.ts` },
    
    // Pages
    { src: 'list.hbs', dest: `pages/${nameCapitalized}ListPage.tsx` },
    { src: 'listTest.hbs', dest: `pages/__tests__/${nameCapitalized}ListPage.test.tsx` },
    { src: 'form.hbs', dest: `pages/${nameCapitalized}FormPage.tsx` },
    { src: 'formTest.hbs', dest: `pages/__tests__/${nameCapitalized}FormPage.test.tsx` },
    
    // Constants
    { src: 'constants.hbs', dest: `constants/${nameLower}.constants.ts` },
    { src: 'headerMap.hbs', dest: `constants/${nameLower}HeaderMap.tsx` },
    { src: 'headerMapTest.hbs', dest: `constants/__tests__/${nameLower}HeaderMap.test.tsx` },
    
    // Components
    { src: 'filters.hbs', dest: `components/${nameCapitalized}Filters.tsx` },

    // Hooks
    { src: 'mutations.hbs', dest: `hooks/${nameLower}.mutations.ts` },
    { src: 'mutationTest.hbs', dest: `hooks/__tests__/${nameLower}.mutations.test.ts` },

    // Routing & Menu
    { src: 'routes.hbs', dest: 'routes.tsx' },
    { src: 'menu.hbs', dest: 'menu.tsx' },
  ];

  for (const template of templates) {
    const templatePath = path.join(templatesDir, template.src);
    const content = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(content);
    const result = compiled(context);
    
    fs.writeFileSync(path.join(targetDir, template.dest), result);
    console.log(chalk.green(`✔️ Created ${template.dest}`));
  }

  updateRootFiles(nameLower);

  console.log(chalk.blue.bold(`\n🎉 Module '${nameCapitalized}' generated successfully!`));
}

main().catch(console.error);
