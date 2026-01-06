import { useState, useRef, useEffect, useCallback } from 'react';

interface CommandOutput {
  id: number;
  command: string;
  output: string;
  isError?: boolean;
  path?: string;
}

interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: Record<string, FileSystemNode>;
  permissions?: string;
  size?: number;
  modified?: Date;
}

// Virtual file system
const createFileSystem = (): FileSystemNode => ({
  type: 'directory',
  name: '/',
  children: {
    home: {
      type: 'directory',
      name: 'home',
      children: {
        user: {
          type: 'directory',
          name: 'user',
          children: {
            Documents: {
              type: 'directory',
              name: 'Documents',
              children: {
                'readme.txt': {
                  type: 'file',
                  name: 'readme.txt',
                  content: 'Bienvenue sur ClaudeOS!\n\nCeci est un systeme d\'exploitation style macOS construit avec React et TypeScript.\n\nAmusez-vous bien!',
                  size: 156,
                  modified: new Date(),
                },
                'notes.md': {
                  type: 'file',
                  name: 'notes.md',
                  content: '# Mes Notes\n\n- Apprendre React\n- Maitriser TypeScript\n- Creer des projets cool',
                  size: 89,
                  modified: new Date(),
                },
                Projets: {
                  type: 'directory',
                  name: 'Projets',
                  children: {},
                },
              },
            },
            Downloads: {
              type: 'directory',
              name: 'Downloads',
              children: {
                'archive.zip': {
                  type: 'file',
                  name: 'archive.zip',
                  content: '[Binary file]',
                  size: 2048,
                  modified: new Date(),
                },
              },
            },
            Desktop: {
              type: 'directory',
              name: 'Desktop',
              children: {},
            },
            Pictures: {
              type: 'directory',
              name: 'Pictures',
              children: {},
            },
            Music: {
              type: 'directory',
              name: 'Music',
              children: {},
            },
            '.zshrc': {
              type: 'file',
              name: '.zshrc',
              content: '# ClaudeOS Shell Configuration\nexport PATH=/usr/bin:/bin:/usr/local/bin\nexport EDITOR=nano\nalias ll="ls -la"\nalias la="ls -a"\nalias cls="clear"',
              size: 145,
              modified: new Date(),
            },
            '.config': {
              type: 'directory',
              name: '.config',
              children: {},
            },
          },
        },
      },
    },
    etc: {
      type: 'directory',
      name: 'etc',
      children: {
        'hosts': {
          type: 'file',
          name: 'hosts',
          content: '127.0.0.1\tlocalhost\n::1\t\tlocalhost',
          size: 45,
          modified: new Date(),
        },
      },
    },
    usr: {
      type: 'directory',
      name: 'usr',
      children: {
        bin: { type: 'directory', name: 'bin', children: {} },
        local: { type: 'directory', name: 'local', children: {} },
      },
    },
    tmp: {
      type: 'directory',
      name: 'tmp',
      children: {},
    },
  },
});

export default function Terminal() {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(createFileSystem);
  const [commandId, setCommandId] = useState(0);
  const [env, setEnv] = useState<Record<string, string>>({
    USER: 'user',
    HOME: '/home/user',
    SHELL: '/bin/zsh',
    PATH: '/usr/bin:/bin:/usr/local/bin',
    TERM: 'xterm-256color',
    LANG: 'fr_FR.UTF-8',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    setHistory([{
      id: 0,
      command: '',
      output: `ClaudeOS Terminal v1.0.0
Tapez "help" pour voir les commandes disponibles.
`,
      path: currentPath,
    }]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on click
  const handleClick = () => {
    inputRef.current?.focus();
  };

  // Navigate file system
  const getNodeAtPath = useCallback((path: string): FileSystemNode | null => {
    const parts = path.split('/').filter(Boolean);
    let node: FileSystemNode = fileSystem;

    for (const part of parts) {
      if (node.type !== 'directory' || !node.children?.[part]) {
        return null;
      }
      node = node.children[part];
    }
    return node;
  }, [fileSystem]);

  const resolvePath = useCallback((path: string): string => {
    if (path.startsWith('~')) {
      path = '/home/user' + path.slice(1);
    }
    if (!path.startsWith('/')) {
      path = currentPath + '/' + path;
    }

    // Resolve . and ..
    const parts = path.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.') {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }, [currentPath]);

  const getDisplayPath = (path: string): string => {
    if (path.startsWith('/home/user')) {
      return '~' + path.slice(10);
    }
    return path;
  };

  // Commands implementation
  const commands: Record<string, (args: string[]) => string> = {
    help: () => `
Commandes disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Navigation
  ----------
  pwd                 Afficher le repertoire courant
  cd <dir>            Changer de repertoire
  ls [-la]            Lister les fichiers

  Fichiers
  --------
  cat <file>          Afficher le contenu d'un fichier
  touch <file>        Creer un fichier vide
  mkdir <dir>         Creer un repertoire
  rm [-r] <path>      Supprimer un fichier/dossier
  cp <src> <dest>     Copier un fichier
  mv <src> <dest>     Deplacer/renommer un fichier
  echo <text>         Afficher du texte
  head <file>         Afficher les premieres lignes
  tail <file>         Afficher les dernieres lignes
  wc <file>           Compter lignes/mots/caracteres

  Systeme
  -------
  whoami              Afficher l'utilisateur
  hostname            Afficher le nom de la machine
  date                Afficher la date et l'heure
  uptime              Afficher le temps de fonctionnement
  uname [-a]          Informations systeme
  env                 Variables d'environnement
  export VAR=val      Definir une variable
  history             Historique des commandes
  clear               Effacer le terminal

  Fun
  ---
  neofetch            Informations systeme stylisees
  cowsay <text>       Vache qui parle
  fortune             Citation aleatoire
  matrix              Effet Matrix
  calc <expr>         Calculatrice

  Aide
  ----
  help                Afficher cette aide
  man <cmd>           Manuel d'une commande
`,

    pwd: () => currentPath,

    cd: (args) => {
      const target = args[0] || '/home/user';
      const newPath = resolvePath(target);
      const node = getNodeAtPath(newPath);

      if (!node) {
        return `cd: ${target}: Aucun fichier ou dossier de ce type`;
      }
      if (node.type !== 'directory') {
        return `cd: ${target}: N'est pas un repertoire`;
      }

      setCurrentPath(newPath);
      return '';
    },

    ls: (args) => {
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const targetPath = args.find(a => !a.startsWith('-')) || currentPath;
      const resolved = resolvePath(targetPath);
      const node = getNodeAtPath(resolved);

      if (!node) {
        return `ls: ${targetPath}: Aucun fichier ou dossier de ce type`;
      }
      if (node.type !== 'directory') {
        return longFormat
          ? `-rw-r--r--  1 user  staff  ${node.size || 0} Jan  5 12:00 ${node.name}`
          : node.name;
      }

      const entries = Object.values(node.children || {});
      const filtered = showAll ? entries : entries.filter(e => !e.name.startsWith('.'));

      if (filtered.length === 0) return '';

      if (longFormat) {
        const lines = filtered.map(e => {
          const perm = e.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = (e.size || 0).toString().padStart(6);
          const color = e.type === 'directory' ? '[[DIR]]' : '';
          return `${perm}  1 user  staff  ${size} Jan  5 12:00 ${color}${e.name}`;
        });
        return lines.join('\n');
      }

      return filtered.map(e => {
        return e.type === 'directory' ? `[[DIR]]${e.name}` : e.name;
      }).join('  ');
    },

    cat: (args) => {
      if (!args[0]) return 'cat: argument manquant';
      const resolved = resolvePath(args[0]);
      const node = getNodeAtPath(resolved);

      if (!node) return `cat: ${args[0]}: Aucun fichier ou dossier de ce type`;
      if (node.type === 'directory') return `cat: ${args[0]}: Est un repertoire`;

      return node.content || '';
    },

    touch: (args) => {
      if (!args[0]) return 'touch: argument manquant';
      const resolved = resolvePath(args[0]);
      const parentPath = resolved.split('/').slice(0, -1).join('/') || '/';
      const fileName = resolved.split('/').pop()!;
      const parent = getNodeAtPath(parentPath);

      if (!parent || parent.type !== 'directory') {
        return `touch: ${args[0]}: Aucun fichier ou dossier de ce type`;
      }

      if (!parent.children![fileName]) {
        parent.children![fileName] = {
          type: 'file',
          name: fileName,
          content: '',
          size: 0,
          modified: new Date(),
        };
        setFileSystem({ ...fileSystem });
      }
      return '';
    },

    mkdir: (args) => {
      if (!args[0]) return 'mkdir: argument manquant';
      const resolved = resolvePath(args[0]);
      const parentPath = resolved.split('/').slice(0, -1).join('/') || '/';
      const dirName = resolved.split('/').pop()!;
      const parent = getNodeAtPath(parentPath);

      if (!parent || parent.type !== 'directory') {
        return `mkdir: ${args[0]}: Aucun fichier ou dossier de ce type`;
      }

      if (parent.children![dirName]) {
        return `mkdir: ${args[0]}: Le fichier existe`;
      }

      parent.children![dirName] = {
        type: 'directory',
        name: dirName,
        children: {},
      };
      setFileSystem({ ...fileSystem });
      return '';
    },

    rm: (args) => {
      const recursive = args.includes('-r') || args.includes('-rf');
      const target = args.find(a => !a.startsWith('-'));

      if (!target) return 'rm: argument manquant';

      const resolved = resolvePath(target);
      const parentPath = resolved.split('/').slice(0, -1).join('/') || '/';
      const name = resolved.split('/').pop()!;
      const parent = getNodeAtPath(parentPath);
      const node = getNodeAtPath(resolved);

      if (!node) return `rm: ${target}: Aucun fichier ou dossier de ce type`;
      if (node.type === 'directory' && !recursive) {
        return `rm: ${target}: Est un repertoire (utiliser -r)`;
      }

      delete parent!.children![name];
      setFileSystem({ ...fileSystem });
      return '';
    },

    echo: (args) => {
      let text = args.join(' ');
      // Handle environment variables
      text = text.replace(/\$(\w+)/g, (_, varName) => env[varName] || '');
      // Handle quotes
      text = text.replace(/^["']|["']$/g, '');
      return text;
    },

    whoami: () => env.USER,

    hostname: () => 'claudeos.local',

    date: () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      };
      return now.toLocaleDateString('fr-FR', options);
    },

    uptime: () => {
      const hours = Math.floor(Math.random() * 100);
      const mins = Math.floor(Math.random() * 60);
      return `${new Date().toLocaleTimeString('fr-FR')}  up ${hours}:${mins.toString().padStart(2, '0')},  1 user,  load averages: 1.42 1.38 1.35`;
    },

    uname: (args) => {
      if (args.includes('-a')) {
        return 'ClaudeOS claudeos.local 1.0.0 ClaudeOS Kernel Version 1.0.0: React 18 x86_64';
      }
      return 'ClaudeOS';
    },

    env: () => Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n'),

    export: (args) => {
      const match = args[0]?.match(/^(\w+)=(.*)$/);
      if (match) {
        setEnv({ ...env, [match[1]]: match[2] });
        return '';
      }
      return 'export: syntaxe invalide';
    },

    history: () => commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(4)}  ${cmd}`).join('\n'),

    clear: () => '__CLEAR__',

    head: (args) => {
      if (!args[0]) return 'head: argument manquant';
      const resolved = resolvePath(args[0]);
      const node = getNodeAtPath(resolved);

      if (!node) return `head: ${args[0]}: Aucun fichier ou dossier de ce type`;
      if (node.type === 'directory') return `head: ${args[0]}: Est un repertoire`;

      const lines = (node.content || '').split('\n');
      return lines.slice(0, 10).join('\n');
    },

    tail: (args) => {
      if (!args[0]) return 'tail: argument manquant';
      const resolved = resolvePath(args[0]);
      const node = getNodeAtPath(resolved);

      if (!node) return `tail: ${args[0]}: Aucun fichier ou dossier de ce type`;
      if (node.type === 'directory') return `tail: ${args[0]}: Est un repertoire`;

      const lines = (node.content || '').split('\n');
      return lines.slice(-10).join('\n');
    },

    wc: (args) => {
      if (!args[0]) return 'wc: argument manquant';
      const resolved = resolvePath(args[0]);
      const node = getNodeAtPath(resolved);

      if (!node) return `wc: ${args[0]}: Aucun fichier ou dossier de ce type`;
      if (node.type === 'directory') return `wc: ${args[0]}: Est un repertoire`;

      const content = node.content || '';
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const chars = content.length;

      return `  ${lines}  ${words}  ${chars} ${args[0]}`;
    },

    neofetch: () => {
      return `
[[CYAN]]                    ..'           [[WHITE]]user[[RESET]]@[[CYAN]]claudeos
[[CYAN]]                 .''.             [[WHITE]]─────────────────
[[CYAN]]             ...'.                [[YELLOW]]OS:[[WHITE]] ClaudeOS 1.0
[[CYAN]]          .'''.                   [[YELLOW]]Host:[[WHITE]] Web Browser
[[CYAN]]        .'..'..                   [[YELLOW]]Kernel:[[WHITE]] React 18.2.0
[[CYAN]]       ..'...'..                  [[YELLOW]]Shell:[[WHITE]] zsh 5.9
[[CYAN]]      ...'....'.                  [[YELLOW]]Resolution:[[WHITE]] ${window.innerWidth}x${window.innerHeight}
[[CYAN]]     ..'......'..                 [[YELLOW]]Theme:[[WHITE]] ClaudeOS Dark
[[CYAN]]    ...........'..                [[YELLOW]]Terminal:[[WHITE]] ClaudeTerminal
[[CYAN]]   .............'.                [[YELLOW]]CPU:[[WHITE]] JavaScript V8
[[CYAN]]  ................                [[YELLOW]]Memory:[[WHITE]] ${Math.round(Math.random() * 4 + 4)}GB / 16GB

                                   [[BLACK]]███[[RED]]███[[GREEN]]███[[YELLOW]]███[[BLUE]]███[[MAGENTA]]███[[CYAN]]███[[WHITE]]███`;
    },

    cowsay: (args) => {
      const text = args.join(' ') || 'Meuh!';
      const line = '─'.repeat(text.length + 2);
      return `
 ┌${line}┐
 │ ${text} │
 └${line}┘
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
    },

    fortune: () => {
      const fortunes = [
        "Un bug n'est qu'une fonctionnalite non documentee.",
        "Il y a 10 types de personnes: celles qui comprennent le binaire et les autres.",
        "Le meilleur code est celui qu'on n'ecrit pas.",
        "En theorie, theorie et pratique sont identiques. En pratique, non.",
        "Les vrais programmeurs n'ont pas peur de la recursion.",
        "99 bugs dans le code, 99 bugs. Corrigez-en un, 127 bugs dans le code.",
        "La perfection est atteinte non pas lorsqu'il n'y a plus rien a ajouter, mais lorsqu'il n'y a plus rien a retirer.",
        "Le cafe est le carburant du developpeur.",
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    },

    matrix: () => {
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
      let output = '';
      for (let i = 0; i < 10; i++) {
        let line = '';
        for (let j = 0; j < 60; j++) {
          line += Math.random() > 0.7 ? '[[GREEN]]' + chars[Math.floor(Math.random() * chars.length)] : ' ';
        }
        output += line + '\n';
      }
      return output + '[[RESET]]';
    },

    calc: (args) => {
      const expr = args.join('');
      try {
        // Safe evaluation - only allow numbers and basic operators
        if (!/^[\d+\-*/().%\s]+$/.test(expr)) {
          return 'calc: expression invalide';
        }
        const result = Function('"use strict"; return (' + expr + ')')();
        return String(result);
      } catch {
        return 'calc: erreur de calcul';
      }
    },

    man: (args) => {
      const manPages: Record<string, string> = {
        ls: `
[[BOLD]]NOM[[RESET]]
     ls - lister le contenu des repertoires

[[BOLD]]SYNOPSIS[[RESET]]
     ls [-la] [fichier ...]

[[BOLD]]DESCRIPTION[[RESET]]
     Pour chaque fichier qui est un repertoire, ls liste le contenu
     du repertoire.

[[BOLD]]OPTIONS[[RESET]]
     -a    Inclure les fichiers dont le nom commence par un point.
     -l    Format long avec permissions, taille et date.
`,
        cd: `
[[BOLD]]NOM[[RESET]]
     cd - changer de repertoire

[[BOLD]]SYNOPSIS[[RESET]]
     cd [repertoire]

[[BOLD]]DESCRIPTION[[RESET]]
     Change le repertoire courant vers le repertoire specifie.
     Sans argument, change vers le repertoire home.
`,
        cat: `
[[BOLD]]NOM[[RESET]]
     cat - concatener et afficher des fichiers

[[BOLD]]SYNOPSIS[[RESET]]
     cat fichier [...]

[[BOLD]]DESCRIPTION[[RESET]]
     Affiche le contenu des fichiers specifies sur la sortie standard.
`,
      };

      if (!args[0]) return 'Quelle page de manuel voulez-vous?';
      return manPages[args[0]] || `Pas de page de manuel pour ${args[0]}`;
    },

    cp: (args) => {
      if (args.length < 2) return 'cp: arguments manquants';
      const srcPath = resolvePath(args[0]);
      const destPath = resolvePath(args[1]);
      const srcNode = getNodeAtPath(srcPath);

      if (!srcNode) return `cp: ${args[0]}: Aucun fichier ou dossier de ce type`;
      if (srcNode.type === 'directory') return `cp: ${args[0]}: Est un repertoire (utiliser -r)`;

      const destParentPath = destPath.split('/').slice(0, -1).join('/') || '/';
      const destName = destPath.split('/').pop()!;
      const destParent = getNodeAtPath(destParentPath);

      if (!destParent || destParent.type !== 'directory') {
        return `cp: ${args[1]}: Aucun fichier ou dossier de ce type`;
      }

      destParent.children![destName] = { ...srcNode, name: destName };
      setFileSystem({ ...fileSystem });
      return '';
    },

    mv: (args) => {
      if (args.length < 2) return 'mv: arguments manquants';
      const result = commands.cp(args);
      if (result) return result;
      commands.rm([args[0]]);
      return '';
    },
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newId = commandId + 1;
    setCommandId(newId);

    // Parse command (handle quotes)
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (const char of trimmed) {
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuotes) {
        if (current) parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) parts.push(current);

    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (command === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    let output = '';
    let isError = false;

    if (commands[command]) {
      try {
        output = commands[command](args);
      } catch (e) {
        output = `Erreur: ${e}`;
        isError = true;
      }
    } else {
      output = `zsh: commande introuvable: ${command}`;
      isError = true;
    }

    setHistory((prev) => [...prev, { id: newId, command: trimmed, output, isError, path: currentPath }]);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion for commands and files
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];

      if (parts.length === 1) {
        // Complete command
        const cmdNames = Object.keys(commands);
        const matches = cmdNames.filter(c => c.startsWith(lastPart));
        if (matches.length === 1) {
          setInput(matches[0] + ' ');
        }
      } else {
        // Complete file path
        const resolved = resolvePath(lastPart || '.');
        const parentPath = lastPart.includes('/')
          ? resolved.split('/').slice(0, -1).join('/') || '/'
          : currentPath;
        const prefix = lastPart.split('/').pop() || '';
        const parent = getNodeAtPath(parentPath);

        if (parent?.children) {
          const matches = Object.keys(parent.children).filter(n => n.startsWith(prefix));
          if (matches.length === 1) {
            parts[parts.length - 1] = lastPart.includes('/')
              ? lastPart.split('/').slice(0, -1).join('/') + '/' + matches[0]
              : matches[0];
            const node = parent.children[matches[0]];
            setInput(parts.join(' ') + (node.type === 'directory' ? '/' : ' '));
          }
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setHistory((prev) => [...prev, { id: commandId + 1, command: input + '^C', output: '', path: currentPath }]);
      setInput('');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  // Render colored output
  const renderOutput = (text: string) => {
    const colorMap: Record<string, string> = {
      '[[RESET]]': '',
      '[[BOLD]]': 'font-bold',
      '[[RED]]': 'text-red-400',
      '[[GREEN]]': 'text-green-400',
      '[[YELLOW]]': 'text-yellow-400',
      '[[BLUE]]': 'text-blue-400',
      '[[MAGENTA]]': 'text-purple-400',
      '[[CYAN]]': 'text-cyan-400',
      '[[WHITE]]': 'text-white',
      '[[BLACK]]': 'text-gray-800',
      '[[DIR]]': 'text-cyan-400 font-bold',
    };

    const parts = text.split(/(\[\[[A-Z]+\]\])/g);
    let currentClass = '';

    return parts.map((part, i) => {
      if (colorMap[part] !== undefined) {
        currentClass = colorMap[part];
        return null;
      }
      return (
        <span key={i} className={currentClass}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e]">
      {/* Terminal header */}
      <div
        className="flex items-center justify-center border-b border-white/10"
        style={{
          padding: '8px 16px',
          background: 'linear-gradient(180deg, rgba(58, 58, 60, 0.98) 0%, rgba(48, 48, 50, 0.98) 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-white/50">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M5 9l3 2-3 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white/70 text-[13px] font-medium">
            user@claudeos: {getDisplayPath(currentPath)}
          </span>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto font-mono text-[13px] leading-relaxed"
        style={{ padding: '16px' }}
        onClick={handleClick}
      >
        {history.map((item) => (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            {item.command && (
              <div className="flex items-center flex-wrap">
                <span className="text-green-400 font-bold">user@claudeos</span>
                <span className="text-white">:</span>
                <span className="text-cyan-400 font-bold">{getDisplayPath(item.path || currentPath)}</span>
                <span className="text-white">$ </span>
                <span className="text-white">{item.command}</span>
              </div>
            )}
            {item.output && (
              <pre className={`whitespace-pre-wrap ${item.isError ? 'text-red-400' : 'text-white/80'}`}>
                {renderOutput(item.output)}
              </pre>
            )}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center flex-wrap">
          <span className="text-green-400 font-bold">user@claudeos</span>
          <span className="text-white">:</span>
          <span className="text-cyan-400 font-bold">{getDisplayPath(currentPath)}</span>
          <span className="text-white">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-[200px] bg-transparent text-white outline-none caret-white"
            style={{ caretColor: '#22c55e' }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between border-t border-white/10 text-[11px] text-white/40"
        style={{ padding: '4px 16px' }}
      >
        <span>zsh</span>
        <span>{commandHistory.length} commandes</span>
      </div>
    </div>
  );
}
