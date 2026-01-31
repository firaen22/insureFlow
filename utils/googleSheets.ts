import { PolicyData, Client } from '../types';

// Declare globals for Google Scripts
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
// OR ENTER THEM WHEN PROMPTED IN THE APP
export const GOOGLE_CONFIG = {
  CLIENT_ID: '', 
  API_KEY: '',   
  SPREADSHEET_ID: '', 
  // Added drive.readonly to list files for selection. 
  // Note: drive.file is better for production to avoid sensitive scopes, 
  // but drive.readonly is needed to see existing user sheets.
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
  DISCOVERY_DOCS: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ],
};

let tokenClient: any;

export const initGoogleClient = async (
  clientId: string, 
  apiKey: string, 
  spreadsheetId?: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Save to config memory
    GOOGLE_CONFIG.CLIENT_ID = clientId;
    GOOGLE_CONFIG.API_KEY = apiKey;
    if (spreadsheetId) GOOGLE_CONFIG.SPREADSHEET_ID = spreadsheetId;

    if (!window.gapi || !window.google) {
      reject('Google Scripts not loaded');
      return;
    }

    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
        });

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_CONFIG.SCOPES,
          callback: '', // defined at request time
        });

        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const signInToGoogle = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject('Token Client not initialized');

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

// --- DRIVE API ---

export interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
    thumbnailLink?: string;
}

export const listSpreadsheets = async (): Promise<DriveFile[]> => {
    try {
        const response = await window.gapi.client.drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
            fields: 'files(id, name, modifiedTime, thumbnailLink)',
            pageSize: 10,
            orderBy: 'modifiedTime desc'
        });
        return response.result.files || [];
    } catch (e) {
        console.error("Error listing files", e);
        throw e;
    }
};

export const createSpreadsheet = async (title: string): Promise<string> => {
    try {
        const response = await window.gapi.client.sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: title,
                },
            },
        });
        
        const spreadsheetId = response.result.spreadsheetId;
        // Update global config temporarily
        GOOGLE_CONFIG.SPREADSHEET_ID = spreadsheetId;
        
        // Initialize structure immediately
        await ensureSheetStructure();
        
        return spreadsheetId;
    } catch (error) {
        console.error("Error creating spreadsheet:", error);
        throw error;
    }
};

// --- DATA MAPPING ---

const mapPolicyToRow = (p: PolicyData): (string | number)[] => {
  return [
    p.id,
    p.policyNumber,
    p.holderName,
    p.planName,
    p.type,
    p.status,
    p.premiumAmount,
    p.paymentMode,
    p.policyAnniversaryDate,
    p.clientBirthday || '',
    JSON.stringify(p.extractedTags || []),
    JSON.stringify({
      riders: p.riders,
      medicalPlanType: p.medicalPlanType,
      medicalExcess: p.medicalExcess,
      sumInsured: p.sumInsured,
      isMultipay: p.isMultipay,
      policyEndDate: p.policyEndDate,
      capitalInvested: p.capitalInvested,
      accidentMedicalLimit: p.accidentMedicalLimit,
      accidentSectionLimit: p.accidentSectionLimit,
      accidentPhysioVisits: p.accidentPhysioVisits
    })
  ];
};

const mapRowToPolicy = (row: any[]): PolicyData => {
  const specifics = row[11] ? JSON.parse(row[11]) : {};
  const tags = row[10] ? JSON.parse(row[10]) : [];

  return {
    id: row[0],
    policyNumber: row[1],
    holderName: row[2],
    planName: row[3],
    type: row[4] as any,
    status: row[5] as any,
    premiumAmount: Number(row[6]),
    paymentMode: row[7] as any,
    policyAnniversaryDate: row[8],
    clientBirthday: row[9],
    extractedTags: tags,
    ...specifics 
  };
};

// --- API CALLS ---

export const ensureSheetStructure = async (): Promise<void> => {
  if (!GOOGLE_CONFIG.SPREADSHEET_ID) throw new Error("No Spreadsheet ID");

  try {
    const meta = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID
    });

    const sheets = meta.result.sheets;
    const policySheet = sheets.find((s: any) => s.properties.title === 'Policies');

    if (!policySheet) {
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        resource: {
          requests: [
            { addSheet: { properties: { title: 'Policies' } } }
          ]
        }
      });
      
      const headers = ['ID', 'Policy No', 'Holder', 'Plan', 'Type', 'Status', 'Premium', 'Mode', 'Anniversary', 'Birthday', 'Tags', 'Specifics'];
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: 'Policies!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [headers] }
      });
    }
  } catch (error) {
    console.error("Error ensuring sheet structure:", error);
    throw error;
  }
};

export const fetchPoliciesFromSheet = async (): Promise<PolicyData[]> => {
  if (!GOOGLE_CONFIG.SPREADSHEET_ID) throw new Error("No Spreadsheet ID");

  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'Policies!A2:L', 
    });

    const rows = response.result.values;
    if (!rows || rows.length === 0) return [];

    return rows.map(mapRowToPolicy);
  } catch (e: any) {
    if (e.result?.error?.code === 400 && e.result?.error?.message?.includes('Unable to parse range')) {
        return []; 
    }
    throw e;
  }
};

export const savePolicyToSheet = async (policy: PolicyData): Promise<void> => {
  if (!GOOGLE_CONFIG.SPREADSHEET_ID) throw new Error("No Spreadsheet ID");

  const row = mapPolicyToRow(policy);

  await window.gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
    range: 'Policies!A:L',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [row],
    },
  });
};

export const syncAllPoliciesToSheet = async (policies: PolicyData[]) => {
   if (!GOOGLE_CONFIG.SPREADSHEET_ID) throw new Error("No Spreadsheet ID");

   await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'Policies!A2:L'
   });

   const rows = policies.map(mapPolicyToRow);
   
   if (rows.length > 0) {
     await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: 'Policies!A2',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });
   }
}
