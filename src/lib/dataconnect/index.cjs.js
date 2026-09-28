const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const AccountType = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  EQUITY: "EQUITY",
}
exports.AccountType = AccountType;

const OwnerType = {
  USER_A: "USER_A",
  USER_B: "USER_B",
  SHARED: "SHARED",
}
exports.OwnerType = OwnerType;

const connectorConfig = {
  connector: 'orbita2-connector',
  service: 'dataconnect',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createJournalWithEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateJournalWithEntries', inputVars);
}
createJournalWithEntriesRef.operationName = 'CreateJournalWithEntries';
exports.createJournalWithEntriesRef = createJournalWithEntriesRef;

exports.createJournalWithEntries = function createJournalWithEntries(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createJournalWithEntriesRef(dcInstance, inputVars));
}
;

const getHouseholdBalanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHouseholdBalance', inputVars);
}
getHouseholdBalanceRef.operationName = 'GetHouseholdBalance';
exports.getHouseholdBalanceRef = getHouseholdBalanceRef;

exports.getHouseholdBalance = function getHouseholdBalance(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHouseholdBalanceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMyEntriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyEntries');
}
getMyEntriesRef.operationName = 'GetMyEntries';
exports.getMyEntriesRef = getMyEntriesRef;

exports.getMyEntries = function getMyEntries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyEntriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const validateJournalBalanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ValidateJournalBalance', inputVars);
}
validateJournalBalanceRef.operationName = 'ValidateJournalBalance';
exports.validateJournalBalanceRef = validateJournalBalanceRef;

exports.validateJournalBalance = function validateJournalBalance(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(validateJournalBalanceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
