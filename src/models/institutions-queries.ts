import Institution from './institution';
import Item from './item';

export const getInstitutionByPlaidId = async (
  userId: number,
  plaidInstitutionId: string,
) => {
  const institution = await Institution.findOne({
    where: { plaidInstitutionId },
    include: { model: Item, where: { userId } },
  });
  return institution;
};

export const isExistingInstitution = async (
  userId: number,
  plaidInstitutionId: string,
) => {
  const institution = await getInstitutionByPlaidId(userId, plaidInstitutionId);

  return institution !== null;
};
