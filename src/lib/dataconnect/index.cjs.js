const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const AccountType = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  EQUITY: "EQUITY",
}
exports.AccountType = AccountType;

const EntryType = {
  DEBIT: "DEBIT",
  CREDIT: "CREDIT",
}
exports.EntryType = EntryType;

const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REVOKED: "REVOKED",
}
exports.InvitationStatus = InvitationStatus;

const MemberSlot = {
  USER_A: "USER_A",
  USER_B: "USER_B",
}
exports.MemberSlot = MemberSlot;

const OwnerType = {
  USER_A: "USER_A",
  USER_B: "USER_B",
  SHARED: "SHARED",
}
exports.OwnerType = OwnerType;

const connectorConfig = {
  connector: 'orbita2-connector',
  service: 'orbita2-f8aa1-service',
  location: 'us-east4'
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

const updateBudgetRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateBudget', inputVars);
}
updateBudgetRef.operationName = 'UpdateBudget';
exports.updateBudgetRef = updateBudgetRef;

exports.updateBudget = function updateBudget(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateBudgetRef(dcInstance, inputVars));
}
;

const deleteBudgetRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteBudget', inputVars);
}
deleteBudgetRef.operationName = 'DeleteBudget';
exports.deleteBudgetRef = deleteBudgetRef;

exports.deleteBudget = function deleteBudget(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteBudgetRef(dcInstance, inputVars));
}
;

const createAccountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAccount', inputVars);
}
createAccountRef.operationName = 'CreateAccount';
exports.createAccountRef = createAccountRef;

exports.createAccount = function createAccount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAccountRef(dcInstance, inputVars));
}
;

const updateAccountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAccount', inputVars);
}
updateAccountRef.operationName = 'UpdateAccount';
exports.updateAccountRef = updateAccountRef;

exports.updateAccount = function updateAccount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAccountRef(dcInstance, inputVars));
}
;

const archiveAccountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ArchiveAccount', inputVars);
}
archiveAccountRef.operationName = 'ArchiveAccount';
exports.archiveAccountRef = archiveAccountRef;

exports.archiveAccount = function archiveAccount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(archiveAccountRef(dcInstance, inputVars));
}
;

const deleteAccountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAccount', inputVars);
}
deleteAccountRef.operationName = 'DeleteAccount';
exports.deleteAccountRef = deleteAccountRef;

exports.deleteAccount = function deleteAccount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAccountRef(dcInstance, inputVars));
}
;

const reassignEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ReassignEntries', inputVars);
}
reassignEntriesRef.operationName = 'ReassignEntries';
exports.reassignEntriesRef = reassignEntriesRef;

exports.reassignEntries = function reassignEntries(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(reassignEntriesRef(dcInstance, inputVars));
}
;

const createSettlementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSettlement', inputVars);
}
createSettlementRef.operationName = 'CreateSettlement';
exports.createSettlementRef = createSettlementRef;

exports.createSettlement = function createSettlement(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSettlementRef(dcInstance, inputVars));
}
;

const deleteSettlementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSettlement', inputVars);
}
deleteSettlementRef.operationName = 'DeleteSettlement';
exports.deleteSettlementRef = deleteSettlementRef;

exports.deleteSettlement = function deleteSettlement(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSettlementRef(dcInstance, inputVars));
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

const updateSavingsProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSavingsProject', inputVars);
}
updateSavingsProjectRef.operationName = 'UpdateSavingsProject';
exports.updateSavingsProjectRef = updateSavingsProjectRef;

exports.updateSavingsProject = function updateSavingsProject(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSavingsProjectRef(dcInstance, inputVars));
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

const createHouseholdAndUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateHouseholdAndUser', inputVars);
}
createHouseholdAndUserRef.operationName = 'CreateHouseholdAndUser';
exports.createHouseholdAndUserRef = createHouseholdAndUserRef;

exports.createHouseholdAndUser = function createHouseholdAndUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createHouseholdAndUserRef(dcInstance, inputVars));
}
;

const seedDefaultAccountsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedDefaultAccounts', inputVars);
}
seedDefaultAccountsRef.operationName = 'SeedDefaultAccounts';
exports.seedDefaultAccountsRef = seedDefaultAccountsRef;

exports.seedDefaultAccounts = function seedDefaultAccounts(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(seedDefaultAccountsRef(dcInstance, inputVars));
}
;

const deleteJournalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteJournal', inputVars);
}
deleteJournalRef.operationName = 'DeleteJournal';
exports.deleteJournalRef = deleteJournalRef;

exports.deleteJournal = function deleteJournal(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteJournalRef(dcInstance, inputVars));
}
;

const updateJournalWithEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateJournalWithEntries', inputVars);
}
updateJournalWithEntriesRef.operationName = 'UpdateJournalWithEntries';
exports.updateJournalWithEntriesRef = updateJournalWithEntriesRef;

exports.updateJournalWithEntries = function updateJournalWithEntries(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateJournalWithEntriesRef(dcInstance, inputVars));
}
;

const updateSharedExpenseWithProrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSharedExpenseWithProration', inputVars);
}
updateSharedExpenseWithProrationRef.operationName = 'UpdateSharedExpenseWithProration';
exports.updateSharedExpenseWithProrationRef = updateSharedExpenseWithProrationRef;

exports.updateSharedExpenseWithProration = function updateSharedExpenseWithProration(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSharedExpenseWithProrationRef(dcInstance, inputVars));
}
;

const createCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCategory', inputVars);
}
createCategoryRef.operationName = 'CreateCategory';
exports.createCategoryRef = createCategoryRef;

exports.createCategory = function createCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCategoryRef(dcInstance, inputVars));
}
;

const updateCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCategory', inputVars);
}
updateCategoryRef.operationName = 'UpdateCategory';
exports.updateCategoryRef = updateCategoryRef;

exports.updateCategory = function updateCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCategoryRef(dcInstance, inputVars));
}
;

const deleteCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCategory', inputVars);
}
deleteCategoryRef.operationName = 'DeleteCategory';
exports.deleteCategoryRef = deleteCategoryRef;

exports.deleteCategory = function deleteCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCategoryRef(dcInstance, inputVars));
}
;

const createTagRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTag', inputVars);
}
createTagRef.operationName = 'CreateTag';
exports.createTagRef = createTagRef;

exports.createTag = function createTag(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createTagRef(dcInstance, inputVars));
}
;

const deleteTagRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTag', inputVars);
}
deleteTagRef.operationName = 'DeleteTag';
exports.deleteTagRef = deleteTagRef;

exports.deleteTag = function deleteTag(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteTagRef(dcInstance, inputVars));
}
;

const setJournalTagsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetJournalTags', inputVars);
}
setJournalTagsRef.operationName = 'SetJournalTags';
exports.setJournalTagsRef = setJournalTagsRef;

exports.setJournalTags = function setJournalTags(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setJournalTagsRef(dcInstance, inputVars));
}
;

const addTagToJournalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddTagToJournal', inputVars);
}
addTagToJournalRef.operationName = 'AddTagToJournal';
exports.addTagToJournalRef = addTagToJournalRef;

exports.addTagToJournal = function addTagToJournal(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addTagToJournalRef(dcInstance, inputVars));
}
;

const createInvitationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateInvitation', inputVars);
}
createInvitationRef.operationName = 'CreateInvitation';
exports.createInvitationRef = createInvitationRef;

exports.createInvitation = function createInvitation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createInvitationRef(dcInstance, inputVars));
}
;

const acceptInvitationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AcceptInvitation', inputVars);
}
acceptInvitationRef.operationName = 'AcceptInvitation';
exports.acceptInvitationRef = acceptInvitationRef;

exports.acceptInvitation = function acceptInvitation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(acceptInvitationRef(dcInstance, inputVars));
}
;

const revokeInvitationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeInvitation', inputVars);
}
revokeInvitationRef.operationName = 'RevokeInvitation';
exports.revokeInvitationRef = revokeInvitationRef;

exports.revokeInvitation = function revokeInvitation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(revokeInvitationRef(dcInstance, inputVars));
}
;

const leaveHouseholdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LeaveHousehold', inputVars);
}
leaveHouseholdRef.operationName = 'LeaveHousehold';
exports.leaveHouseholdRef = leaveHouseholdRef;

exports.leaveHousehold = function leaveHousehold(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(leaveHouseholdRef(dcInstance, inputVars));
}
;

const removeHouseholdMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveHouseholdMember', inputVars);
}
removeHouseholdMemberRef.operationName = 'RemoveHouseholdMember';
exports.removeHouseholdMemberRef = removeHouseholdMemberRef;

exports.removeHouseholdMember = function removeHouseholdMember(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(removeHouseholdMemberRef(dcInstance, inputVars));
}
;

const backfillMemberSlotsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'BackfillMemberSlots');
}
backfillMemberSlotsRef.operationName = 'BackfillMemberSlots';
exports.backfillMemberSlotsRef = backfillMemberSlotsRef;

exports.backfillMemberSlots = function backfillMemberSlots(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(backfillMemberSlotsRef(dcInstance, inputVars));
}
;

const updateUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserProfile', inputVars);
}
updateUserProfileRef.operationName = 'UpdateUserProfile';
exports.updateUserProfileRef = updateUserProfileRef;

exports.updateUserProfile = function updateUserProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars);
  return executeMutation(updateUserProfileRef(dcInstance, inputVars));
}
;

const getHouseholdAccountsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHouseholdAccounts', inputVars);
}
getHouseholdAccountsRef.operationName = 'GetHouseholdAccounts';
exports.getHouseholdAccountsRef = getHouseholdAccountsRef;

exports.getHouseholdAccounts = function getHouseholdAccounts(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHouseholdAccountsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
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

const getBudgetsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBudgets', inputVars);
}
getBudgetsRef.operationName = 'GetBudgets';
exports.getBudgetsRef = getBudgetsRef;

exports.getBudgets = function getBudgets(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBudgetsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBudgetsByMonthRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBudgetsByMonth', inputVars);
}
getBudgetsByMonthRef.operationName = 'GetBudgetsByMonth';
exports.getBudgetsByMonthRef = getBudgetsByMonthRef;

exports.getBudgetsByMonth = function getBudgetsByMonth(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBudgetsByMonthRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
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

const getExpensesByHouseholdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExpensesByHousehold', inputVars);
}
getExpensesByHouseholdRef.operationName = 'GetExpensesByHousehold';
exports.getExpensesByHouseholdRef = getExpensesByHouseholdRef;

exports.getExpensesByHousehold = function getExpensesByHousehold(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExpensesByHouseholdRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getIncomesByHouseholdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetIncomesByHousehold', inputVars);
}
getIncomesByHouseholdRef.operationName = 'GetIncomesByHousehold';
exports.getIncomesByHouseholdRef = getIncomesByHouseholdRef;

exports.getIncomesByHousehold = function getIncomesByHousehold(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getIncomesByHouseholdRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getInternalTransfersByHouseholdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInternalTransfersByHousehold', inputVars);
}
getInternalTransfersByHouseholdRef.operationName = 'GetInternalTransfersByHousehold';
exports.getInternalTransfersByHouseholdRef = getInternalTransfersByHouseholdRef;

exports.getInternalTransfersByHousehold = function getInternalTransfersByHousehold(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getInternalTransfersByHouseholdRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getCurrentUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCategoriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCategories', inputVars);
}
getCategoriesRef.operationName = 'GetCategories';
exports.getCategoriesRef = getCategoriesRef;

exports.getCategories = function getCategories(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCategoriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTagsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTags', inputVars);
}
getTagsRef.operationName = 'GetTags';
exports.getTagsRef = getTagsRef;

exports.getTags = function getTags(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTagsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getJournalTagsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetJournalTags', inputVars);
}
getJournalTagsRef.operationName = 'GetJournalTags';
exports.getJournalTagsRef = getJournalTagsRef;

exports.getJournalTags = function getJournalTags(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getJournalTagsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSettlementsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSettlements', inputVars);
}
getSettlementsRef.operationName = 'GetSettlements';
exports.getSettlementsRef = getSettlementsRef;

exports.getSettlements = function getSettlements(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSettlementsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getJournalBalanceV2Ref = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetJournalBalanceV2', inputVars);
}
getJournalBalanceV2Ref.operationName = 'GetJournalBalanceV2';
exports.getJournalBalanceV2Ref = getJournalBalanceV2Ref;

exports.getJournalBalanceV2 = function getJournalBalanceV2(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getJournalBalanceV2Ref(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getInvitationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInvitation', inputVars);
}
getInvitationRef.operationName = 'GetInvitation';
exports.getInvitationRef = getInvitationRef;

exports.getInvitation = function getInvitation(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getInvitationRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getHouseholdMembersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHouseholdMembers', inputVars);
}
getHouseholdMembersRef.operationName = 'GetHouseholdMembers';
exports.getHouseholdMembersRef = getHouseholdMembersRef;

exports.getHouseholdMembers = function getHouseholdMembers(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHouseholdMembersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPendingInvitationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPendingInvitations', inputVars);
}
getPendingInvitationsRef.operationName = 'GetPendingInvitations';
exports.getPendingInvitationsRef = getPendingInvitationsRef;

exports.getPendingInvitations = function getPendingInvitations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPendingInvitationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const negativeEntriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'NegativeEntries');
}
negativeEntriesRef.operationName = 'NegativeEntries';
exports.negativeEntriesRef = negativeEntriesRef;

exports.negativeEntries = function negativeEntries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(negativeEntriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const unbalancedJournalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'UnbalancedJournals');
}
unbalancedJournalsRef.operationName = 'UnbalancedJournals';
exports.unbalancedJournalsRef = unbalancedJournalsRef;

exports.unbalancedJournals = function unbalancedJournals(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(unbalancedJournalsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
