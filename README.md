# Ideia em Fluxo

Aplicativo desktop para organizar projetos, divisões e tarefas. Construído com Electron e pensado para funcionar localmente, com exportação e restauração de backups em JSON.

## Desenvolvimento

```bash
npm install
npm start
```

## Gerar o instalador do Windows

```bash
npm run dist:win
```

O instalador é criado na pasta `release/`.

## Dados e backups

Os projetos ficam armazenados localmente no perfil do aplicativo. Use o botão **Backup** para exportar ou restaurar seus dados. Arquivos pessoais de backup e instaladores não são enviados ao repositório.
