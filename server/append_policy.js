
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// 1. CONFIGURATION
// Place your service-account.json in the same folder as this script
const CREDENTIALS_PATH = path.join(__dirname, 'service-account.json');
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual Sheet ID

// Check if credentials exist
if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Error: service-account.json not found in server/ directory.');
    process.exit(1);
}

const creds = require(CREDENTIALS_PATH);

// 2. DATA MAPPING HELPER
// This function ensures data format matches your React Frontend logic exactly
const mapPolicyToRow = (p) => {
    return {
        'ID': p.id,
        'Policy No': p.policyNumber,
        'Holder': p.holderName,
        'Plan': p.planName,
        'Type': p.type,
        'Status': p.status,
        'Premium': p.premiumAmount,
        'Mode': p.paymentMode,
        'Anniversary': p.policyAnniversaryDate,
        'Birthday': p.clientBirthday || '',
        'Tags': JSON.stringify(p.extractedTags || []),
        // Combine specific fields into one JSON column just like the frontend
        'Specifics': JSON.stringify({
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
    };
};

// 3. MAIN FUNCTION
async function appendPolicyToSheet(policyData) {
    try {
        // Initialize Auth - using google-auth-library for modern support
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        // Load document info
        await doc.loadInfo();
        console.log(`Loaded doc: ${doc.title}`);

        // Get the specific sheet
        let sheet = doc.sheetsByTitle['Policies'];
        
        // If sheet doesn't exist, create it with headers
        if (!sheet) {
            console.log("Sheet 'Policies' not found, creating it...");
            sheet = await doc.addSheet({ title: 'Policies' });
            await sheet.setHeaderRow([
                'ID', 'Policy No', 'Holder', 'Plan', 'Type', 'Status', 
                'Premium', 'Mode', 'Anniversary', 'Birthday', 'Tags', 'Specifics'
            ]);
        }

        // Prepare Row Data
        const rowData = mapPolicyToRow(policyData);

        // Append to the last row
        await sheet.addRow(rowData);
        
        console.log('Successfully appended policy:', policyData.policyNumber);

    } catch (error) {
        console.error('Error appending to sheet:', error);
    }
}

// 4. USAGE EXAMPLE
// Mock Data (Simulating a policy object from your app)
const mockPolicy = {
    id: `node-${Date.now()}`,
    policyNumber: 'NODE-JS-DEMO-001',
    planName: 'Backend Auto-Insert Plan',
    holderName: 'Node Server Bot',
    clientBirthday: '1995-05-05',
    type: 'Life',
    policyAnniversaryDate: '01/01',
    paymentMode: 'Yearly',
    premiumAmount: 5000,
    status: 'Active',
    extractedTags: ['Backend', 'Automated'],
    riders: [
        { name: 'Server Uptime Rider', type: 'Life', premiumAmount: 200 }
    ],
    sumInsured: 1000000
};

// Execute
appendPolicyToSheet(mockPolicy);
