const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

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

const createSharedExpenseWithProrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSharedExpenseWithProration', inputVars);
}
createSharedExpenseWithProrationRef.operationName = 'CreateSharedExpenseWithProration';
exports.createSharedExpenseWithProrationRef = createSharedExpenseWithProrationRef;

exports.createSharedExpenseWithProration = function createSharedExpenseWithProration(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSharedExpenseWithProrationRef(dcInstance, inputVars));
}
;

const createMsiExpenseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMsiExpense', inputVars);
}
createMsiExpenseRef.operationName = 'CreateMsiExpense';
exports.createMsiExpenseRef = createMsiExpenseRef;

exports.createMsiExpense = function createMsiExpense(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMsiExpenseRef(dcInstance, inputVars));
}
;

const createBudgetRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBudget', inputVars);
}
createBudgetRef.operationName = 'CreateBudget';
exports.createBudgetRef = createBudgetRef;

exports.createBudget = function createBudget(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createBudgetRef(dcInstance, inputVars));
}
;

const updateBudgetAmountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateBudgetAmount', inputVars);
}
updateBudgetAmountRef.operationName = 'UpdateBudgetAmount';
exports.updateBudgetAmountRef = updateBudgetAmountRef;

exports.updateBudgetAmount = function updateBudgetAmount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateBudgetAmountRef(dcInstance, inputVars));
}
;

const createSavingsProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSavingsProject', inputVars);
}
createSavingsProjectRef.operationName = 'CreateSavingsProject';
exports.createSavingsProjectRef = createSavingsProjectRef;

exports.createSavingsProject = function createSavingsProject(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSavingsProjectRef(dcInstance, inputVars));
}
;

const updateProjectProgressRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateProjectProgress', inputVars);
}
updateProjectProgressRef.operationName = 'UpdateProjectProgress';
exports.updateProjectProgressRef = updateProjectProgressRef;

exports.updateProjectProgress = function updateProjectProgress(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateProjectProgressRef(dcInstance, inputVars));
}
;

const createExternalAssetRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateExternalAsset', inputVars);
}
createExternalAssetRef.operationName = 'CreateExternalAsset';
exports.createExternalAssetRef = createExternalAssetRef;

exports.createExternalAsset = function createExternalAsset(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createExternalAssetRef(dcInstance, inputVars));
}
;

const updateExternalAssetRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateExternalAsset', inputVars);
}
updateExternalAssetRef.operationName = 'UpdateExternalAsset';
exports.updateExternalAssetRef = updateExternalAssetRef;

exports.updateExternalAsset = function updateExternalAsset(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateExternalAssetRef(dcInstance, inputVars));
}
;

const upsertExchangeRateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertExchangeRate', inputVars);
}
upsertExchangeRateRef.operationName = 'UpsertExchangeRate';
exports.upsertExchangeRateRef = upsertExchangeRateRef;

exports.upsertExchangeRate = function upsertExchangeRate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertExchangeRateRef(dcInstance, inputVars));
}
;

const getHouseholdNetBalancesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHouseholdNetBalances', inputVars);
}
getHouseholdNetBalancesRef.operationName = 'GetHouseholdNetBalances';
exports.getHouseholdNetBalancesRef = getHouseholdNetBalancesRef;

exports.getHouseholdNetBalances = function getHouseholdNetBalances(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHouseholdNetBalancesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMonthBudgetsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMonthBudgets', inputVars);
}
getMonthBudgetsRef.operationName = 'GetMonthBudgets';
exports.getMonthBudgetsRef = getMonthBudgetsRef;

exports.getMonthBudgets = function getMonthBudgets(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getMonthBudgetsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUnassignedCashRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUnassignedCash', inputVars);
}
getUnassignedCashRef.operationName = 'GetUnassignedCash';
exports.getUnassignedCashRef = getUnassignedCashRef;

exports.getUnassignedCash = function getUnassignedCash(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUnassignedCashRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSavingsProjectsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSavingsProjects', inputVars);
}
getSavingsProjectsRef.operationName = 'GetSavingsProjects';
exports.getSavingsProjectsRef = getSavingsProjectsRef;

exports.getSavingsProjects = function getSavingsProjects(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSavingsProjectsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getExternalAssetsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExternalAssets', inputVars);
}
getExternalAssetsRef.operationName = 'GetExternalAssets';
exports.getExternalAssetsRef = getExternalAssetsRef;

exports.getExternalAssets = function getExternalAssets(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExternalAssetsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getNetWorthRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNetWorth', inputVars);
}
getNetWorthRef.operationName = 'GetNetWorth';
exports.getNetWorthRef = getNetWorthRef;

exports.getNetWorth = function getNetWorth(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getNetWorthRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getLatestRateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLatestRate', inputVars);
}
getLatestRateRef.operationName = 'GetLatestRate';
exports.getLatestRateRef = getLatestRateRef;

exports.getLatestRate = function getLatestRate(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getLatestRateRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
