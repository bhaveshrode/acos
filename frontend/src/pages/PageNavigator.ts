import { PageResolver } from "./PageResolver.js";
import { PageCache } from "./PageCache.js";

/**
 * PageNavigator managing page transitions.
 */
export class PageNavigator {
  private activePageId?: string;

  constructor(
    private readonly resolver: PageResolver,
    private readonly cache: PageCache
  ) {}

  public navigateTo(pageId: string): string {
    const descriptor = this.resolver.resolve(pageId);
    this.activePageId = descriptor.metadata.id;
    return this.activePageId;
  }

  public getActivePageId(): string | undefined {
    return this.activePageId;
  }
}
