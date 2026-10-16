# UCL matchweek snapshot

`ucl-standings.json` contains the actual responses from `/ucl/standings` and
`/ucl/predicted_table`, plus the capture timestamp and backend origin. The UCL
standings component imports it directly: page loads, table switches, and builds
make no standings or predicted-table requests to Hugging Face.

Create the snapshot once with `npm run snapshot:ucl`. If the file already exists,
the command exits without contacting the backend.

To replace it for a new matchweek:

```sh
npm run snapshot:ucl -- --force
```

The script uses `UCL_API_ORIGIN` or `NEXT_PUBLIC_API_URL` from the environment
(also loading `.env.local` and `.env`). Both an origin and a URL ending in `/api`
are accepted. It makes one request per endpoint, validates both responses, then
atomically replaces the snapshot. Errors leave the previous snapshot intact.

For a future cron job, run the refresh command from this frontend directory,
then rebuild and redeploy the frontend so visitors receive the new snapshot.
No cron job is configured yet. Empty responses are saved and displayed as an
empty state; request errors are printed with the backend's `detail` message.
