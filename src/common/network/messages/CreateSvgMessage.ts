import { NetworkSide } from "@common/network/sides";
import * as Networker from "monorepo-networker";

interface Payload {
  // width: number;
  // height: number;
  url: string;
}

export class CreateSvgMessage extends Networker.MessageType<Payload> {
  public receivingSide(): Networker.Side {
    return NetworkSide.PLUGIN;
  }

  public handle(payload: Payload, from: Networker.Side): void {
    if (figma.editorType === "figma") {
      try {
        figma.createImageAsync(payload.url).then(async (image: Image) => {
          const node = figma.createRectangle();

          const { width, height } = await image.getSizeAsync();
          node.resize(width, height);

          // Your image is added to the canvas
          node.fills = [
            {
              type: "IMAGE",
              imageHash: image.hash,
              scaleMode: "FILL",
            },
          ];
        });
        // If there's an error, notify the user.
      } catch (error) {
        figma.notify(error);
      }
    }
  }
}
