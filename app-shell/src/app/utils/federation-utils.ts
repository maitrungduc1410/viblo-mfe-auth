type Scope = unknown;
type Factory = () => any;

type Container = {
  init(shareScope: Scope): void;
  get(module: string): Factory;
};

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope };

const moduleMap: Record<string, any> = {};

function loadRemoteEntry(remoteEntry: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (moduleMap[remoteEntry]) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    const token = localStorage.getItem('token');
    script.src = `${remoteEntry}?token=${token}`;

    script.onerror = reject;

    script.onload = () => {
      moduleMap[remoteEntry] = true;
      resolve(); // window is the global namespace
    };

    document.body.append(script);
  });
}

async function lookupExposedModule<T>(
  remoteName: string,
  exposedModule: string
): Promise<T> {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');

  const container = (window as any)[remoteName] as Container; // or get the container somewhere else
  // Initialize the container, it may provide shared modules

  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(exposedModule);
  const Module = factory();
  return Module as T;
}

export type LoadRemoteModuleOptions = {
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
};

export async function loadRemoteModule(
  options: LoadRemoteModuleOptions
): Promise<any> {
  if (options.remoteEntry.startsWith('vite:')) {
    const token = localStorage.getItem('token');

    // Extract the base URL from options.remoteEntry (e.g., 'http://localhost:3001/remoteEntry.js')
    const baseUrl = options.remoteEntry.split('vite:')[1];

    // Append the token as a query parameter
    const remoteUrl = `${baseUrl}?token=${token}`;

    // Load the module with the token included
    const module = await import(/* webpackIgnore: true */ remoteUrl);

    (window as any)[options.remoteName] = module;
  } else {
    await loadRemoteEntry(options.remoteEntry);
  }
  return await lookupExposedModule<any>(
    options.remoteName,
    options.exposedModule
  );
}
