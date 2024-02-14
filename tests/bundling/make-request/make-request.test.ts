import test, { ExecutionContext } from "ava"
import { getTestCLI } from "tests/fixtures/get-test-cli"
import os from "node:os"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import { loadBundle } from "src"

const createAndLoadBundle = async (t: ExecutionContext) => {
  const cli = await getTestCLI(t)

  const tempPath = path.join(os.tmpdir(), `${randomUUID()}.js`)
  const appDirectoryPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "./api"
  )
  const execution = cli.executeCommand([
    "bundle",
    "-o",
    tempPath,
    "--routes-directory",
    appDirectoryPath,
  ])
  const result = await execution.waitUntilExit()
  t.is(result.exitCode, 0)

  return loadBundle(tempPath)
}

test.serial("simple request works", async (t) => {
  const bundle = await createAndLoadBundle(t)
  t.truthy(bundle.makeRequest)

  const response = await bundle.makeRequest(
    new Request(new URL("https://example.com/health"))
  )
  t.is(response.status, 200)
  t.is(await response.text(), "ok")
})

test.serial("can make request when hosted on subpath", async (t) => {
  const bundle = await createAndLoadBundle(t)

  const response = await bundle.makeRequest(
    new Request(new URL("https://example.com/a/sample/module/sub/path/health")),
    {
      removePathnamePrefix: "/a/sample/module/sub/path",
      automaticallyRemovePathnamePrefix: false,
    }
  )
  t.is(response.status, 200)
  t.is(await response.text(), "ok")
})

test.serial("automatically detects and removes base path", async (t) => {
  const bundle = await createAndLoadBundle(t)

  const response = await bundle.makeRequest(
    new Request(new URL("https://example.com/a/sample/module/sub/path/health"))
  )
  t.is(response.status, 200)
  t.is(await response.text(), "ok")
})
