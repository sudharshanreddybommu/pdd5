export interface StateCities {
  state: string;
  cities: string[];
}

export const ALL_INDIA_STATES_AND_CITIES: StateCities[] = [
  {
    state: 'Andhra Pradesh',
    cities: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati',
      'Kakinada', 'Rajahmundry', 'Kadapa', 'Anantapur', 'Eluru', 'Vizianagaram',
      'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur',
      'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Srikakulam'
    ]
  },
  {
    state: 'Telangana',
    cities: [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam',
      'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet',
      'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Kamareddy', 'Secunderabad'
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
      'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram',
      'Erode', 'Dindigul', 'Cuddalore', 'Kumbakonam', 'Hosur', 'Tuticorin', 'Karaikudi'
    ]
  },
  {
    state: 'Karnataka',
    cities: [
      'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi',
      'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur',
      'Bidar', 'Hosapete', 'Gadag', 'Udupi', 'Hassan', 'Bhadravati', 'Mandya'
    ]
  },
  {
    state: 'Maharashtra',
    cities: [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik', 'Kalyan-Dombivli',
      'Vasai-Virar', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Navi Mumbai', 'Solapur',
      'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Panvel'
    ]
  },
  {
    state: 'Delhi (NCT)',
    cities: [
      'New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi',
      'West Delhi', 'Dwarka', 'Rohini', 'Saket', 'Connaught Place', 'Vasant Kunj'
    ]
  },
  {
    state: 'Kerala',
    cities: [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur',
      'Alappuzha', 'Kottayam', 'Palakkad', 'Manjeri', 'Thalassery', 'Ponnani'
    ]
  },
  {
    state: 'Gujarat',
    cities: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
      'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar'
    ]
  },
  {
    state: 'Uttar Pradesh',
    cities: [
      'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj',
      'Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad',
      'Jhansi', 'Muzaffarnagar', 'Mathura', 'Greater Noida', 'Ayodhya'
    ]
  },
  {
    state: 'West Bengal',
    cities: [
      'Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman',
      'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni'
    ]
  },
  {
    state: 'Rajasthan',
    cities: [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur',
      'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar'
    ]
  },
  {
    state: 'Madhya Pradesh',
    cities: [
      'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar',
      'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli'
    ]
  },
  {
    state: 'Punjab',
    cities: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali',
      'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Khanna'
    ]
  },
  {
    state: 'Haryana',
    cities: [
      'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak',
      'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa'
    ]
  },
  {
    state: 'Bihar',
    cities: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga',
      'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra'
    ]
  },
  {
    state: 'Odisha',
    cities: [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri',
      'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore'
    ]
  },
  {
    state: 'Assam',
    cities: [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia',
      'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar'
    ]
  },
  {
    state: 'Jammu & Kashmir',
    cities: [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Sopore'
    ]
  },
  {
    state: 'Goa',
    cities: [
      'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'
    ]
  },
  {
    state: 'Jharkhand',
    cities: [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh'
    ]
  },
  {
    state: 'Chhattisgarh',
    cities: [
      'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Jagdalpur'
    ]
  },
  {
    state: 'Uttarakhand',
    cities: [
      'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Rudrapur', 'Nainital'
    ]
  },
  {
    state: 'Himachal Pradesh',
    cities: [
      'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Baddi'
    ]
  },
  {
    state: 'Tripura',
    cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar']
  },
  {
    state: 'Meghalaya',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh']
  },
  {
    state: 'Manipur',
    cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur']
  },
  {
    state: 'Nagaland',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang']
  },
  {
    state: 'Puducherry',
    cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  },
  {
    state: 'Chandigarh',
    cities: ['Chandigarh']
  }
];

export const ALL_INDIAN_CITIES_FLAT: string[] = Array.from(
  new Set(ALL_INDIA_STATES_AND_CITIES.flatMap(s => s.cities))
).sort((a, b) => a.localeCompare(b));

export const ALL_INDIAN_STATES: string[] = ALL_INDIA_STATES_AND_CITIES.map(s => s.state);
