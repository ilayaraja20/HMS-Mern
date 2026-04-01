import { Card, CardContent, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import PaymentIcon from "@mui/icons-material/Payment";
import ReportIcon from "@mui/icons-material/Report";

function DashboardCards(){

  const cards = [
    {title:"Total Students",value:120,icon:<PeopleIcon/>},
    {title:"Total Rooms",value:40,icon:<HotelIcon/>},
    {title:"Payments",value:50000,icon:<PaymentIcon/>},
    {title:"Complaints",value:3,icon:<ReportIcon/>}
  ];

  return(

    <div
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:"20px",
        marginTop:"20px"
      }}
    >

      {cards.map(card =>(

        <Card
          key={card.title}
          sx={{
            borderRadius:"12px",
            boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
          }}
        >

          <CardContent>

            <div
              style={{
                display:"flex",
                justifyContent:"space-between"
              }}
            >

              <Typography variant="h6">
                {card.title}
              </Typography>

              {card.icon}

            </div>

            <Typography
              variant="h4"
              sx={{marginTop:"10px"}}
            >
              {card.value}
            </Typography>

          </CardContent>

        </Card>

      ))}

    </div>

  );

}

export default DashboardCards;