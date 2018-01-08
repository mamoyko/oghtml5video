module.exports.convertTime = function(date) {
  var newMonth;
	var date = new Date(date);
	var month = date.getMonth() + 1;
	var hours = date.getHours();
	var mins = date.getMinutes();
	switch(month){
				case 1 :
					newMonth =  'January';
					break;
				case 2 :
					newMonth = 'February';
					break;
				case 3 :
					newMonth = 'March';
					break;
				case 4 :
					newMonth = 'April';
					break;
				case 5 :
					newMonth = 'May';
					break;
				case 6 :
					newMonth = 'June';
					break;
				case 7 :
					newMonth = 'July';
					break;
				case 8 :
					newMonth = 'August';
					break;
				case 9 :
					newMonth = 'September';
					break;
				case 10 :
					newMonth = 'October';
					break;
				case 11 :
					newMonth = 'November';
					break;
				case 12 :
					newMonth = 'December';
					break;
			}
			return newMonth + " " + date.getDate() + " " + date.getFullYear() + " " + hours  + ":" + mins;
}
