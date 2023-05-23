import Container, { Service, Inject } from "typedi";
import zlib from "zlib";
import { Subscriber } from "zeromq";
import { Logger } from "winston";
import config from "@config/index";
import FSDJumpHandler from "./fsdjump";
import DockedService from "./docked";

@Service()
export default class StreamService {
  /**
   *
   */
  constructor(
    @Inject("logger") private logger: Logger,
    private url: string = config.streamUrl
  ) {}

  public connect(): Subscriber {
    const socket = new Subscriber();

    socket.connect(this.url);
    socket.subscribe("");

    this.logger.info("EDDN subscriber connected to %s", this.url);
    return socket;
  }

  public async Run(): Promise<void> {
    const socket: Subscriber = this.connect();

    this.listen(socket);
  }

  public async listen(socket: Subscriber): Promise<void> {
    for await (const [src] of socket) {
      try {
        const [event, data] = this.extractDataFromSocketSource(src);
        switch (event) {
          case "Docked": {
            const start = new Date().getTime();
            await Container.get(DockedService).handleDockedEvent(data);
            this.logger.info("Docked: %s ms", new Date().getTime() - start);
            break;
          }
          case "FSDJump": {
            const start = new Date().getTime();
            await Container.get(FSDJumpHandler).handleEvent(data);
            this.logger.info("FSDJump: %s ms", new Date().getTime() - start);
            break;
          }
          default:
            // this.logger.info("EVENT: %s", event);
            break;
        }
      } catch (error) {
        this.logger.error(
          "An error occurred while listening to EDDN datastream: %o",
          error
        );
      }
    }
  }

  public extractDataFromSocketSource(source: Buffer): [string, any] {
    const msg = JSON.parse(zlib.inflateSync(source).toString());

    const event: string = msg.message.event
      ? msg.message.event
      : this.getImpliedEvent(msg["$schemaRef"]);

    const data: any = msg.message;

    return [event, data];
  }

  private getImpliedEvent(schemaRef: string) {
    return schemaRef.split("/")[4];
  }
}
