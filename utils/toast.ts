// 简单的消息提示工具，替代 antd 的 message

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private getContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private show(message: string, type: MessageType, options: ToastOptions = {}) {
    const container = this.getContainer();
    const duration = options.duration || 3000;

    const toast = document.createElement('div');
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    }[type];

    toast.className = `px-4 py-3 rounded-lg shadow-lg text-white ${bgColor} min-w-[300px] flex items-center justify-between animate-in slide-in-from-right`;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'ml-4 text-white hover:text-gray-200 cursor-pointer text-xl leading-none';
    closeButton.textContent = '×';
    closeButton.onclick = () => toast.remove();
    
    toast.appendChild(messageSpan);
    toast.appendChild(closeButton);

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  success(message: string, options?: ToastOptions) {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.show(message, 'error', options);
  }

  warning(message: string, options?: ToastOptions) {
    return this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.show(message, 'info', options);
  }
}

export const toast = new ToastManager();
