// Consta: nominal bench enclosure, not a fabrication release. Units: mm.
// Component heights/reservations are assumptions described in parametros.json.
// Open in OpenSCAD, use show_lid=false to inspect the component reservations.
$fn=64;
L=52; W=36; H=12; wall=1.5; radius=6;
show_lid=true;
show_components=true;
module rounded_body(l,w,h,r){
  linear_extrude(h) hull(){
    translate([r,r]) circle(r=r);
    translate([l-r,r]) circle(r=r);
    translate([r,w-r]) circle(r=r);
    translate([l-r,w-r]) circle(r=r);
  }
}
module shell(){
  difference(){
    rounded_body(L,W,H,radius);
    translate([wall,wall,wall])
      rounded_body(L-2*wall,W-2*wall,H,radius-wall);
  }
}
color([0.96,0.96,0.94]) shell();
if(show_lid) color([0.98,0.98,0.96,0.5])
  translate([0,0,H-wall]) rounded_body(L,W,wall,radius);
if(show_components){
  color([0.7,0.72,0.74]) translate([3,6,2.5]) cube([26,24,5]);
  color([0.12,0.35,0.24]) translate([31,12.5,3]) cube([16,11,3.5]);
}
// CR2032 requires a custom PCB/negative contact, not represented by these boxes.
// No claim that lid retention, cable routing or RF keep-out has been validated.
