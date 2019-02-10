import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
import { SettingsComponent } from '../components/settings/settings.component';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly componentFactoryResolver: ComponentFactoryResolver;
  private readonly appRef: ApplicationRef;
  private readonly injector: Injector;

  private settingsComponentPortal: ComponentPortal<SettingsComponent>;
  private settingsHost: DomPortalOutlet;

  constructor(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector) {
    this.componentFactoryResolver = componentFactoryResolver;
    this.appRef = appRef;
    this.injector = injector;
  }

  showSettings(): void {
    const settingsWindow = window.open('') as Window;
    (window as any).childwin = settingsWindow;

    setTimeout(() => {
      this.synchronizeStyleNodes(window.document.head, settingsWindow.document.head);

      console.log(settingsWindow.document.head);
      const settingsBody = settingsWindow.document.getElementsByTagName('body')[0];

      (window as any).settingsBody = settingsBody;
      (window as any).settingsWindow = settingsWindow;

      this.settingsComponentPortal = new ComponentPortal(SettingsComponent);
      this.settingsHost = new DomPortalOutlet(settingsBody, this.componentFactoryResolver, this.appRef, this.injector);
      this.settingsHost.attach(this.settingsComponentPortal);
    }, 1000);

    //    this.settingsHost.detach();
  }

  private synchronizeStyleNodes(source: HTMLElement, target: HTMLElement) {
    let insertedNodes: Node[] = [];

    const observer = new MutationObserver((_records, _observer) => {
      for (const node of insertedNodes) {
        target.removeChild(node);
      }

      insertedNodes = [];

      for (const node of Array.from(source.childNodes)) {
        const istStyleNode = (node.nodeName == 'STYLE');
        const isStyleSheetLink = (node.nodeName == 'LINK' && (node as HTMLLinkElement).rel == 'stylesheet');

        if (istStyleNode || isStyleSheetLink) {
          const clone = node.cloneNode(true);

          if (isStyleSheetLink) {
            (clone as HTMLLinkElement).href = (node as HTMLLinkElement).href;
          }

          target.appendChild(clone);
          insertedNodes.push(clone);
        }
      }
    });

    observer.observe(source, { childList: true, attributes: true, characterData: true, subtree: true });
  }
}
