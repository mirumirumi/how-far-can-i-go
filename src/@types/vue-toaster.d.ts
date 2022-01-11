declare module '@/components/modules/vue-toaster' {
  export const install: PluginFunction<{}>;  // eslint-disable-line

  export interface ToasterOptions {
    message?: string;
    type?: 'default' | 'success' | 'info' | 'warning' | 'error';
    position?: 'top' | 'bottom' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
    duration?: number;
    dismissible?: boolean;
    onClick?(): void;
    onClose?(): void;
    queue?: boolean;
    pauseOnHover?: boolean;
    useDefaultCss?: boolean;
  }
  export = class Toaster {
    clear(): void;

    show(message: string, options?: ToasterOptions): void;
    success(message: string, options?: ToasterOptions): void;
    error(message: string, options?: ToasterOptions): void;
    info(message: string, options?: ToasterOptions): void;
    warning(message: string, options?: ToasterOptions): void;
  };
}
