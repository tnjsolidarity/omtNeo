import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

export const TAMIL_NADU_DISTRICTS = [
  { value: "Ariyalur", label: "Ariyalur" },
  { value: "Chengalpattu", label: "Chengalpattu" },
  { value: "Chennai", label: "Chennai" },
  { value: "Coimbatore", label: "Coimbatore" },
  { value: "Cuddalore", label: "Cuddalore" },
  { value: "Dharmapuri", label: "Dharmapuri" },
  { value: "Dindigul", label: "Dindigul" },
  { value: "Erode", label: "Erode" },
  { value: "Kallakurichi", label: "Kallakurichi" },
  { value: "Kanchipuram", label: "Kanchipuram" },
  { value: "Kanyakumari", label: "Kanyakumari" },
  { value: "Karur", label: "Karur" },
  { value: "Krishnagiri", label: "Krishnagiri" },
  { value: "Madurai", label: "Madurai" },
  { value: "Mayiladuthurai", label: "Mayiladuthurai" },
  { value: "Nagapattinam", label: "Nagapattinam" },
  { value: "Namakkal", label: "Namakkal" },
  { value: "Nilgiris", label: "Nilgiris" },
  { value: "Perambalur", label: "Perambalur" },
  { value: "Pudukkottai", label: "Pudukkottai" },
  { value: "Ramanathapuram", label: "Ramanathapuram" },
  { value: "Ranipet", label: "Ranipet" },
  { value: "Salem", label: "Salem" },
  { value: "Sivaganga", label: "Sivaganga" },
  { value: "Tenkasi", label: "Tenkasi" },
  { value: "Thanjavur", label: "Thanjavur" },
  { value: "Theni", label: "Theni" },
  { value: "Thoothukudi", label: "Thoothukudi" },
  { value: "Tiruchirappalli", label: "Tiruchirappalli" },
  { value: "Tirunelveli", label: "Tirunelveli" },
  { value: "Tirupathur", label: "Tirupathur" },
  { value: "Tiruppur", label: "Tiruppur" },
  { value: "Tiruvallur", label: "Tiruvallur" },
  { value: "Tiruvannamalai", label: "Tiruvannamalai" },
  { value: "Tiruvarur", label: "Tiruvarur" },
  { value: "Vellore", label: "Vellore" },
  { value: "Viluppuram", label: "Viluppuram" },
  { value: "Virudhunagar", label: "Virudhunagar" },
];

const DistrictPlaceSelect = ({
  districtValue,
  placeValue,
  onDistrictChange,
  onPlaceChange,
  members = [],
  required = false,
}) => {
  const [sameAsDistrict, setSameAsDistrict] = useState(false);

  // Synchronize checkbox state based on values
  useEffect(() => {
    if (districtValue && districtValue === placeValue) {
      setSameAsDistrict(true);
    } else {
      setSameAsDistrict(false);
    }
  }, [districtValue, placeValue]);

  // Extract unique existing places for the selected district from members
  const getPlaceOptions = () => {
    if (!districtValue) return [];
    const places = members
      .filter((m) => m.district === districtValue && m.place)
      .map((m) => m.place);
    const uniquePlaces = Array.from(new Set(places));
    return uniquePlaces.map((p) => ({ value: p, label: p }));
  };

  const handleDistrictChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    onDistrictChange(value);
    if (sameAsDistrict) {
      onPlaceChange(value);
    } else if (placeValue === districtValue) {
      onPlaceChange("");
    }
  };

  const handlePlaceChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    onPlaceChange(value);
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsDistrict(checked);
    if (checked && districtValue) {
      onPlaceChange(districtValue);
    }
  };

  return (
    <>
      {/* District Dropdown */}
      <div className="form-field">
        <label className={required ? "required" : ""}>District</label>
        <Select
          name="district"
          options={TAMIL_NADU_DISTRICTS}
          value={TAMIL_NADU_DISTRICTS.find((d) => d.value === districtValue) || null}
          onChange={handleDistrictChange}
          placeholder="Select District"
          menuPortalTarget={document.body}
          className="react-select-container"
          classNamePrefix="react-select"
          isClearable
        />
      </div>

      {/* Place Dropdown */}
      <div className="form-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className={required ? "required" : ""}>Place</label>
          {districtValue && (
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "normal", color: "#64748b" }}>
              <input
                type="checkbox"
                checked={sameAsDistrict}
                onChange={handleCheckboxChange}
                style={{ margin: 0, width: "14px", height: "14px", cursor: "pointer" }}
              />
              Same as District
            </label>
          )}
        </div>
        <CreatableSelect
          name="place"
          options={getPlaceOptions()}
          value={placeValue ? { value: placeValue, label: placeValue } : null}
          onChange={handlePlaceChange}
          placeholder="Select or Type Place"
          menuPortalTarget={document.body}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={sameAsDistrict}
          isClearable
        />
      </div>
    </>
  );
};

export default DistrictPlaceSelect;
