import paho.mqtt.client as mqtt
import json
import time
import random
import os
import configparser

# --- CONFIGURATION ---
MQTT_BROKER_HOST = "localhost"
MQTT_PORT = 1883
CONFIG_FILE = 'cart_config.ini'

# --- MOCK PRODUCT DATABASE ---
MOCK_PRODUCTS = [
    {"product_id": "FV001", "product_name": "Apple - Royal Gala", "price": 180.00},
    {"product_id": "DE001", "product_name": "Toned Milk (1L)", "price": 62.00},
    {"product_id": "BB001", "product_name": "Whole Wheat Bread", "price": 50.00},
    {"product_id": "SN001", "product_name": "Potato Chips - Salted", "price": 35.00},
    {"product_id": "BV002", "product_name": "Cola (2.25L)", "price": 99.00},
    {"product_id": "PS005", "product_name": "Salt (1kg)", "price": 22.00},

]

# --- HELPER FUNCTIONS ---
def generate_mock_mac():
    """Generates a random, plausible MAC address."""
    return "00:AA:BB:%02x:%02x:%02x" % (
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255)
    )

# --- WORKFLOW 1: ANNOUNCEMENT ---
def run_announcement_mode():
    mall_id = input("--- This is a new cart. Please enter the Mall ID to begin: ")
    if not mall_id:
        print("Mall ID cannot be empty. Exiting.")
        return None, None
    mock_mac = generate_mock_mac()
    print(f"\n--- 🛒 Announcing presence for Mall ID: {mall_id} ---")
    print(f"   - This cart's unique MAC Address is: {mock_mac}")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"announce-{mock_mac}")
    def on_connect(client, userdata, flags, rc, properties):
        if rc == 0:
            print(f"✅ [Announce] Connected anonymously.")
            announce_topic = f"smartcart/provisioning/announce/{mall_id}"
            payload = json.dumps({"macAddress": mock_mac})
            client.publish(announce_topic, payload)
            print(f"   - Announcement sent to server.")
            time.sleep(1)
            client.disconnect()
        else:
            print(f"❌ [Announce] FAILED to connect. RC={rc}.")
    client.on_connect = on_connect
    client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
    client.loop_forever()
    return mall_id, mock_mac

# --- WORKFLOW 2: WAITING FOR CLAIM ---
def run_wait_for_claim_mode(mac_address):
    print(f"\n--- ⏳ WAITING FOR CLAIM: Go to web UI, find MAC {mac_address}, and 'Claim' it. ---")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"wait-{mac_address}")
    is_claimed = False
    def on_connect(client, userdata, flags, rc, properties):
        if rc == 0:
            claim_topic = f"smartcart/provisioning/claimed/{mac_address}"
            client.subscribe(claim_topic)
            print(f"   - Listening for claim confirmation on: {claim_topic}")
        else:
            print(f"❌ [Wait] FAILED to connect. RC={rc}.")
    def on_message(client, userdata, msg):
        nonlocal is_claimed
        print(f"\n🎉 [Wait] CART HAS BEEN CLAIMED BY ADMIN!")
        if json.loads(msg.payload.decode()).get("status") == "claimed":
            is_claimed = True
            client.disconnect()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
    client.loop_forever()
    return is_claimed

# --- WORKFLOW 3: ACTIVATION ---
def run_activation_mode(mall_id):
    print("\n--- 🔑 Starting in ACTIVATION MODE ---")
    print("   - Please get credentials from the 'View' button in the web UI.")
    cart_id = input("   - Enter Cart ID: ")
    username = input("   - Enter MQTT Username: ")
    password = input("   - Enter MQTT Password: ")
    if not all([cart_id, username, password]):
        print("All fields are required. Exiting.")
        return False
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"PiCart-{cart_id}")
    client.username_pw_set(username, password)
    is_activated = False
    def on_connect(client, userdata, flags, rc, properties):
        nonlocal is_activated
        if rc == 0:
            print(f"\n✅ [Activation] SUCCESS! Connected securely as '{username}'")
            config = configparser.ConfigParser()
            config['SMARTCART'] = {'mallId': mall_id, 'cartId': cart_id, 'mqtt_user': username, 'mqtt_pass': password}
            with open(CONFIG_FILE, 'w') as configfile:
                config.write(configfile)
            print(f"   - Identity saved to {CONFIG_FILE}. Cart is now fully provisioned.")
            is_activated = True
            client.disconnect()
        else:
            print(f"❌ [Activation] FAILED. RC={rc} (Not Authorized). Check credentials.")
            is_activated = False
            client.disconnect()
    client.on_connect = on_connect
    client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
    client.loop_forever()
    return is_activated

# --- WORKFLOW 4: SHOPPING MODE ---
def run_shopping_mode():
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE)
    username = config['SMARTCART']['mqtt_user']
    password = config['SMARTCART']['mqtt_pass']
    cart_id = config['SMARTCART']['cartId']
    
    print(f"\n--- 🛒 Starting in ADVANCED SHOPPING MODE (Cart ID: {cart_id}) ---")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"PiCart-{cart_id}")
    client.username_pw_set(username, password)
    
    def on_connect(client, userdata, flags, rc, properties):
        if rc == 0:
            print(f"✅ [Shopping] Connected securely as '{username}'")
            command_topic = f"smartcart/{username}/commands"
            client.subscribe(command_topic)
            print(f"   - Listening for server commands on: {command_topic}")
        else:
            print(f"❌ [Shopping] FAILED to connect. RC={rc}.")
    
    def on_message(client, userdata, msg):
        payload = json.loads(msg.payload.decode())
        print(f"\n[Shopping] Received command from server: {payload.get('command')}")
        if payload.get('command') == 'paymentInfo':
            print("   - ✅ PAYMENT SUCCESS: Received payment URL. Shopping session complete.")
        elif payload.get('command') == 'paymentFailed':
            print("   - ❌ PAYMENT FAILED: Server reported a failure. Please try again.")
        print("   - Session finished. Shutting down in 10 seconds.")
        time.sleep(10)
        client.disconnect()

    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
    client.loop_start()

    print("   - Cart is now live. Starting shopping simulation...")
    time.sleep(2)

    try:
        shopping_cart = []
        num_items_to_add = random.randint(3, 4)
        print("\n--- Simulating adding items... ---")
        for _ in range(num_items_to_add):
            item_to_add = random.choice(MOCK_PRODUCTS)
            shopping_cart.append(item_to_add)
            item_topic = f"smartcart/{username}/events/item_added"
            item_payload = json.dumps({"item": item_to_add})
            client.publish(item_topic, item_payload)
            print(f"   - 🛒 Added '{item_to_add['product_name']}'. Notifying server.")
            time.sleep(random.randint(9, 15))

        print("\n--- Simulating payment request... ---")
        total_amount = sum(item['price'] for item in shopping_cart)
        total_in_paise = int(total_amount * 100)
        payment_topic = f"smartcart/{username}/events/payment_request"
        payment_payload = json.dumps({"amount": total_in_paise})
        client.publish(payment_topic, payment_payload)
        print(f"   - 💳 Sent payment request for ₹{total_amount:.2f} (sent as {total_in_paise} paise).")
        print("   - Waiting for payment confirmation from server...")
        
        client.loop_forever()

    except KeyboardInterrupt:
        print("\nShutting down mock cart...")
    finally:
        client.loop_stop()
        client.disconnect()

# --- MAIN ---
if __name__ == "__main__":
    if not os.path.exists(CONFIG_FILE):
        mall_id, mac_address = run_announcement_mode()
        if mall_id and mac_address:
            if run_wait_for_claim_mode(mac_address):
                if run_activation_mode(mall_id):
                    run_shopping_mode()
    else:
        run_shopping_mode()