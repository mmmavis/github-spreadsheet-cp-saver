import GoogleSpreadsheet from 'google-spreadsheet';
import habitat from 'habitat';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GOOGLE_API_CLIENT_EMAIL = habitat.get(`GOOGLE_API_CLIENT_EMAIL`);
const GOOGLE_API_PRIVATE_KEY = habitat.get(`GOOGLE_API_PRIVATE_KEY`);
const GOOGLE_API_SPREADSHEET_ID = habitat.get(`GOOGLE_API_SPREADSHEET_ID`);

export default function(uuids, callback) {
  var sheet = new GoogleSpreadsheet(GOOGLE_API_SPREADSHEET_ID);

  // line breaks are essential for the private key.
  // if reading this private key from env var this extra replace step is a MUST
  sheet.useServiceAccountAuth({
    "client_email": GOOGLE_API_CLIENT_EMAIL,
    "private_key": GOOGLE_API_PRIVATE_KEY.replace(/\\n/g, `\n`)
  }, (err) => {
    if (err) {
      console.log(`[Error] ${err}`);
      callback(err);
    }

    // GoogleSpreadsheet.getRows(worksheet_id, callback)
    sheet.getRows(1, (getRowError, rows) => {
      if (getRowError) {
        console.log(`[getRowError]`, getRowError);
      }

      let matchedRows = rows.filter(row => {
        return uuids.indexOf(row.uuid) > -1;
      }).map(row => {
        return {
          firstname: row.firstname,
          surname: row.surname,
          email: row.email,
          name: row.name,
          githubissuenumber: row.githubissuenumber
        }
      });

      callback(err, matchedRows);
    });
  });
}
