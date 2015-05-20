
//===========================================================================================
//=====================   Banner Funcion ==============================================
//===========================================================================================
Parse.Cloud.define("Banner", function(request, response) {
			var ban = Parse.Object.extend("Add");
			var query = new Parse.Query(ban);
			query.equalTo("isVisible",true);
			query.find({
			  success: function(results) {
			   // alert("Successfully retrieved " + results.length + " scores.");
			    // Do something with the returned Parse.Object values
			var link="";  
			  for (var i = 0; i < results.length; i++) { 
			      var object = results[i];
			  
		        link+=object.get("adbanner").url();
		     
				
			    }
			    Parse.Cloud.httpRequest({
			        method: 'POST',
			        url: 'https://www.googleapis.com/urlshortener/v1/url?key={AIzaSyC1a_P3VexflHPNUQ-2MYbT1q__r2F33oM}',
			        body: {         
		            	shortUrl:link
			            
			        },
			        success: function(httpResponse) {
			            response.success(" Message : " + httpResponse.text);
			        },
			        error: function(httpResponse) {
			            response.error('Request failed with response code ' + httpResponse.status);
			        }
			    });
			
				//response.success(link+" ");
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

	
});



//===========================================================================================
//=====================   VerifyPhone Funcion ==============================================
//===========================================================================================
Parse.Cloud.define("VerifyPhone", function(request, response) {
    Parse.Cloud.useMasterKey();
    var options = request.params.option;
    var phonee = request.params.phone;
    var vcodee = request.params.vcode;
    var length = 0;
    var found = false;
    var id = "";


    if (options == "update") {
        var query = new Parse.Query("Customer");
        query.equalTo("custPhone", phonee),
        query.equalTo("custVerificationCode", vcodee)
        query.find({
            success: function(results) {
                var name = "";
                for (var i = 0; i < results.length; ++i) {
                    var object = results[i];
                    name += (object.id);
                }
                if (!name || 0 === name.length) {
                    response.success("update false");
                } else {

                    Parse.Cloud.run('updateIsverfied', {
                        userid: name,
                        option: "nosms",
                        phone: phonee
                    }, {
                        success: function(ratings) {},
                        error: function(error) {}
                    });
                    response.success("update true" + name);
                }
            },
            error: function() {
                response.error("body lookup failed");
            }
        });
    } else if (options == "reset") {

        var query = new Parse.Query("Customer");
        query.equalTo("custPhone", phonee),
            query.find({
                success: function(results) {
                    var name = "";
                    for (var i = 0; i < results.length; ++i) {
                        var object = results[i];
                        name += (object.id);
                    }
                    if (!name || 0 === name.length) {
                        response.success("reset false");
                    } else {

                        Parse.Cloud.run('updateIsverfied', {
                            userid: name,
                            option: "sms",
                            phone: phonee
                        }, {
                            success: function(ratings) {},
                            error: function(error) {}
                        });
                        response.success("reset true");
                    }
                },
                error: function() {
                    response.error("body lookup failed");
                }
            });

    }
});
//===============================End of VerifyPhone===============================================

//===========================================================================================
//=====================   updateIsverfied Funcion ===========================================
//===========================================================================================


Parse.Cloud.define("updateIsverfied", function(request, response) {
    var phonee = request.params.phone;
    var userid = request.params.userid;
    var option = request.params.option;
    if (option == "nosms") {
	        var query = new Parse.Query("Customer");
	        query.equalTo("objectId", userid);
			query.find().then(function(cust) {
    		  cust[0].set("isActive",true);
			  return cust[0].save();
			});
		
    } else if (option == "sms") {
        var query = new Parse.Query("Customer");
	    query.equalTo("objectId", userid);
		query.find().then(function(cust) {
		var newVcode = Math.floor((Math.random() * 1000) + 1000);
	       cust[0].set("custVerificationCode", newVcode);  
		Parse.Cloud.run('sendMsg', {
		                    phone: phonee,
		                    msg: "Verification code is:" + newVcode
		                }, {
		                    success: function(ratings) {
		                        // ratings should be 4.5
		                        response.success("sms sent");
		                    },
		                    error: function(error) {
		                        response.error(error);
		                    }
		                });
		return cust[0].save();
		});
    }
});
////===============================End of updateIsverfied======================================



//===========================================================================================
//=====================   SMS Funcion =======================================================
//===========================================================================================
Parse.Cloud.define("sendMsg", function(request, response) {

    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://www.experttexting.com/exptapi/exptsms.asmx/SendSMS',
        body: {
            UserID: 'haitham11228',
            PWD: 'oman123456',
            APIKEY: 'ybhx4djryszppjc',
            FROM: 'Ev',
            TO: request.params.phone,
            MSG: request.params.msg
        },
        success: function(httpResponse) {
            response.success(" Message : " + request.params.msg + " ,  is sent to nafrat : " + request.params.phone);
        },
        error: function(httpResponse) {
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
});
//===============================End of Sms===============================================

//===========================================================================================
//=====================   SignUp Funcion ====================================================
//===========================================================================================
Parse.Cloud.define("SignUp", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Customer");
    var CustFound = false;
    var custID = "";
    var changed = false;
    var newVcode = Math.floor((Math.random() * 1000) + 1000);

    query.equalTo("custPhone", request.params.phone);
    query.find({
        success: function(results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                custID = object.id;
                CustFound = true;

            }
            if (CustFound == true) {
                Parse.Cloud.useMasterKey();
                var Customer = Parse.Object.extend("Customer");

                var cust = new Parse.Query(Customer);
                query.equalTo("objectId", custID);
                query.first({
                    success: function(object) {

                        object.set("custVerificationCode", newVcode);
                        object.save();
                    },
                    error: function(error) {
                        alert("Error: " + error.code + " " + error.message);
                        response.error(error);
                    }
                });


                Parse.Cloud.run('sendMsg', {
                    phone: request.params.phone,
                    msg: "Verification code is:" + newVcode
                }, {
                    success: function(ratings) {
                        // ratings should be 4.5
                        response.success("sms sent");
                    },
                    error: function(error) {
                        response.error(error);
                    }
                });


            } else {
                var Customer = Parse.Object.extend("Customer");
                var customer = new Customer();

                customer.set("custFirstName", request.params.custFirstName);
                customer.set("custLastName", request.params.custLastName);
                customer.set("custPhone", request.params.phone);
                customer.set("custDiscount", 0);
                customer.set("isActive", false);
                var vcode = Math.floor((Math.random() * 1000) + 1000);
                customer.set("custVerificationCode", vcode);
                customer.save(null, {
                    success: function(customer) {

                        Parse.Cloud.run('sendMsg', {
                            phone: request.params.phone,
                            msg: "Verification code is:" + vcode
                        }, {
                            success: function(ratings) {
                                // ratings should be 4.5

                            },
                            error: function(error) {
                                response.error(error);
                            }
                        });

                        response.success("sms sent");
                    },
                    error: function(customer, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        alert('Failed to create new object, with error code: ' + error.message);
                        response.error(error);
                    }
                });
            }


        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
            response.error(error);
        }
    });




});
//===============================End of SignUp===============================================


//===========================================================================================
//=====================   Find customer Funcion =============================================
//===========================================================================================
	Parse.Cloud.define("FindCust", function(request, response) {
	    var GameScore = Parse.Object.extend("Customer");
	    var query = new Parse.Query(GameScore);
	    var res = "";
	    query.equalTo("custPhone", "96711760");
	    query.find({
	        success: function(results) {
	            alert("Successfully retrieved " + results.length + " scores.");
	            // Do something with the returned Parse.Object values
	            for (var i = 0; i < results.length; i++) {
	                var object = results[i];
	                alert(object.id + ' - ' + object.get('custFirstName'));
	                res += object.id + " - " + object.get("custFirstName");
	            }
	            response.success("Found:" + res);
	        },
	        error: function(error) {
	            alert("Error: " + error.code + " " + error.message);
	            response.error(error);
	        }
	    });
	});
//===============================End of FindCust=============================================

//===========================================================================================
//=====================   Find sub category   ===============================================
//===========================================================================================

Parse.Cloud.define("Findsubcat", function(request, response) {
   
    var categoryname = request.params.subcatname;
 
    var category = Parse.Object.extend("Category");
    var subcat = Parse.Object.extend("SubCategory");
    
    var catquery = new Parse.Query(category);
    catquery.equalTo("Name", categoryname);

    var subcatquery = new Parse.Query(subcat);
    subcatquery.matchesQuery("subcatID", catquery);
   
    subcatquery.find({
        success: function(results) {
            //alert("Successfully retrieved " + results.length + " scores.");
            response.success(results);
        },
        error: function(error) {
         //  alert("Error: " + error.code + " " + error.message);
            response.error(error);
        }
    });
});
//===========================================================================================
//=====================   Find type name of sub category   ===============================================
//===========================================================================================

Parse.Cloud.define("Subtype", function(request, response) {
   
     var subcattitle = request.params.subtitle;
 
     var subcat = Parse.Object.extend("SubCategory");
     var subtype = Parse.Object.extend("subtype");
   
    
    var catquery = new Parse.Query(subcat);
    catquery.equalTo("title", subcattitle);

    var subcatquery = new Parse.Query(subtype);
    subcatquery.matchesQuery("subcatID", catquery);
   
    subcatquery.find({
        success: function(results) {
            //alert("Successfully retrieved " + results.length + " scores.");
            response.success(results);
        },
        error: function(error) {
         //  alert("Error: " + error.code + " " + error.message);
            response.error(error);
        }
    });
});
//===========================================================================================
//=====================   Find Props of subtype  ============================================
//===========================================================================================
Parse.Cloud.define("SubTypeProperties", function(request, response) {
            var subtypename = request.params.subtype;
    
		    var subtype = Parse.Object.extend("subtype");
            var Property = Parse.Object.extend("Property");

		    var subtype_query = new Parse.Query(subtype);
		    subtype_query.equalTo("type_name", subtypename);

		    var Property_query = new Parse.Query(Property);
		    Property_query.matchesQuery("subtypeid", subtype_query);
    
			Property_query.find({
			  success: function(results) {
			        response.success(results);
			  },
			  error: function(error) {
                console.log("FAILLLL!!!!!!!!!! somthing went wrong");  
			    alert("Error: " + error.code + " " + error.message);
			  }
     });
});



//===========================================================================================
//=====================   Add To WishList  ==================================================
//===========================================================================================
Parse.Cloud.define("addToWishlist", function(request, response) {
            var custId = request.params.custID;
            var prodID = request.params.prodId;
        
            var Customer = Parse.Object.extend("Customer");
            var Customer_query = new Parse.Query(Customer);
		    Customer_query.equalTo("objectId", custId);
            
            var Product = Parse.Object.extend("Product");
		    var Product_query = new Parse.Query(Product);
		    Product_query.equalTo("objectId", prodID);
    
            var wishlist = Parse.Object.extend("WishList");
            var tw=new wishlist();
    
			var query = new Parse.Query(wishlist);
			query.matchesQuery("custid",Customer_query);
            query.matchesQuery("prodid",Product_query);
			query.find({
			  success: function(results) {
                  if(results.length>0)
                  {
                     response.success("found"); 
                     alert("Found: "+results.id);
                  }
                  else{
                      response.success("Null"); 
                      alert("WishList item Not Found");
                  }
			    
			  },
			  error: function(error) {
                console.log("FAILLLL!!!!!!!!!! somthing went wrong");  
			    alert("Error: " + error.code + " " + error.message);
			  }
     });
});














