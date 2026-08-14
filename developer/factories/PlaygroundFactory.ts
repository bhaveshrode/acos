import { PlaygroundManager } from "../playground/PlaygroundManager.js";

export class PlaygroundFactory {
  public createManager(): PlaygroundManager {
    return new PlaygroundManager();
  }
}
