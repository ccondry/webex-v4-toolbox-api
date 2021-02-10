module.exports = function (name, id) {
  const additionalInfo = {
    'addedSkillIds': [],
    'removedSkillIds': [],
    'updatedSkillIds': [],
    'addedEnumInfo': [],
    'removedEnumInfo': []
  }
  
  const profileData = [{
    // dCloud_Default_Skill ID
    id: 'AXOXS4Npqu_2NSrhawvu',
    type: 'Text',
    value: id
  }]

	return [{
    type: 'skill-profile',
    attributes: {
    profileData__s: JSON.stringify(profileData),
    name__s: name,
    description__s: '',
    status__i: 1,
    _type__s: 'skill-profile',
    additionalInfo__s: JSON.stringify(additionalInfo),
		}
	}]
}
