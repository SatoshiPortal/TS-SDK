
export type HelloWorldType = {
  message: string,
  version: string,
}

export const HelloWorld = (): HelloWorldType => {

  return {
    message: "Welcome on Bull Bitcoin TypeScript SDK",
    version: "0.1.0"
  }

}