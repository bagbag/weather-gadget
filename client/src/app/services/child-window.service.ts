import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector, Type } from '@angular/core';
import { timeout } from '../utils/timing';

export type ChildWindowHandle<T> = {
  nativeWindow: Window;
  component: T,
  close: () => void;
};

@Injectable({
  providedIn: 'root'
})
export class ChildWindowService {
  private readonly componentFactoryResolver: ComponentFactoryResolver;
  private readonly appRef: ApplicationRef;
  private readonly injector: Injector;

  constructor(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector) {
    this.componentFactoryResolver = componentFactoryResolver;
    this.appRef = appRef;
    this.injector = injector;
  }

  async showComponent<T>(component: Type<T>): Promise<ChildWindowHandle<T>> {
    const childWindow = window.open('') as Window;

    await timeout(250);

    const componentPortal = new ComponentPortal(component);
    const childWindowBody = childWindow.document.getElementsByTagName('body')[0];
    const componentOutlet = new DomPortalOutlet(childWindowBody, this.componentFactoryResolver, this.appRef, this.injector);

    this.synchronizeStyleNodes(window, childWindow);
    const componentRef = componentOutlet.attach(componentPortal);

    const handle = {
      nativeWindow: childWindow,
      component: componentRef.instance,
      close: () => childWindow.close()
    };

    return handle;
  }

  private synchronizeStyleNodes(source: Window, target: Window): void {
    let insertedNodes: Node[] = [];

    function copyNodes(): void {
      for (const node of insertedNodes) {
        target.document.head.removeChild(node);
      }

      insertedNodes = [];

      for (const node of Array.from(source.document.head.childNodes)) {
        const isStyleNode = (node.nodeName == 'STYLE');
        const isStyleSheetLink = (node.nodeName == 'LINK' && (node as HTMLLinkElement).rel == 'stylesheet');

        if (isStyleNode || isStyleSheetLink) {
          const clone = node.cloneNode(true);

          if (isStyleSheetLink) {
            (clone as HTMLLinkElement).href = (node as HTMLLinkElement).href;
          }

          target.document.head.appendChild(clone);
          insertedNodes.push(clone);
        }
      }
    }

    copyNodes();

    const observer = new MutationObserver((_records, _observer) => {
      copyNodes();
    });

    observer.observe(source.document.head, { childList: true, attributes: true, characterData: false, subtree: false });

    source.addEventListener('close', () => observer.disconnect());
    target.addEventListener('close', () => observer.disconnect());
  }
}
